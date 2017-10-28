import sleep from 'sleep-promise';
import { repeat, head, tail, last, range, merge } from 'ramda';
import { getUpdates, getResizings } from '../api';
import { colorToByteArray } from '../utils/color';

function imageDataCell(data, x, y) {
  return (y * data.width * 4) + (x * 4);
}

function makeCanvas(size) {
  // initially all white
  return new ImageData(new Uint8ClampedArray(repeat(255, size * size * 4)), size, size);
}

function migrateCanvas(prev, size) {
  if (prev === null) return makeCanvas(size);
  if (prev.width === size) {
    const canvas = new ImageData(size, size);
    canvas.data.set(prev.data);
    return canvas;
  }

  const canvas = makeCanvas(size);

  const offset = (size - prev.width) / 2;

  for (let x = 0; x < prev.width; x += 1) {
    for (let y = 0; y < prev.height; y += 1) {
      canvas.data[imageDataCell(canvas, x + offset, y + offset)] =
        prev.data[imageDataCell(prev, x, y)];
      canvas.data[imageDataCell(canvas, x + offset, y + offset) + 1] =
        prev.data[imageDataCell(prev, x, y) + 1];
      canvas.data[imageDataCell(canvas, x + offset, y + offset) + 2] =
        prev.data[imageDataCell(prev, x, y) + 2];
      canvas.data[imageDataCell(canvas, x + offset, y + offset) + 3] =
        prev.data[imageDataCell(prev, x, y) + 3];
    }
  }

  return canvas;
}

export default {
  namespaced: true,
  state: {
    frontCanvas: -1,
  },
  getters: {
    canvas(state) {
      if (state.frontCanvas === -1) return null;
      return state.canvases[state.frontCanvas].color;
    },
  },
  mutations: {
    init(state, { from, to, interval, duration }) {
      state.interval = interval;
      state.duration = duration;
      state.renderedTo = Math.max(from / 1000, 1490986860);
      state.from = state.renderedTo;
      state.to = to / 1000;
      state.every = (state.to - state.from) / (duration / interval);

      state.frontCanvas = -1;
      state.canvasSize = 0;
      state.showedTo = state.from;
      state.canvases = repeat(null, Math.max(2, 1000 / interval));
      state.toRender = range(0, state.canvases.length - 1);

      state.updateBufSize = state.canvases.length * 2;
      state.updates = [];

      state.fetchingUpdates = false;
    },

    saveUpdates(state, updates) {
      state.updates.push(...updates);
    },

    consumeUpdate(state) {
      state.renderedTo = head(state.updates).at;
      state.updates = tail(state.updates);
    },

    markRendered(state) {
      state.toRender = tail(state.toRender);
    },

    addToRender(state, canvasID) {
      state.toRender = state.toRender.concat(canvasID);
    },

    saveResizings(state, resizings) {
      state.resizings = resizings;
    },

    consumeResizing(state) {
      state.canvasSize = head(state.resizings).size;
      state.resizings = tail(state.resizings);
    },

    updateCanvas(state, { canvasID, canvas }) {
      const newCanvas = canvas && merge(state.canvases[canvasID], canvas);
      state.canvases.splice(canvasID, 1, newCanvas);
    },

    setFrontCanvas(state, canvasID) {
      if (canvasID >= 0) {
        state.showedTo = state.canvases[canvasID].at;
      }
      state.frontCanvas = canvasID;
    },

    setFetchingUpdates(state) {
      state.fetchingUpdates = true;
    },

    unsetFetchingUpdates(state) {
      state.fetchingUpdates = false;
    },
  },
  actions: {
    async init({ commit, dispatch, state }, payload) {
      console.log('init');
      commit('init', payload);

      const updateBufSize = state.updateBufSize;
      const end = Math.min(state.to, state.from + (state.every * updateBufSize));

      const [updates, resizings] = await Promise.all([
        getUpdates(state.every, state.from, end),
        getResizings(state.from, state.to),
      ]);

      commit('saveUpdates', updates.data);
      commit('saveResizings', resizings.data);

      dispatch('renderCanvas');
      return dispatch('showCanvas', 0);
    },

    async renderCanvas({ commit, dispatch, state }) {
      while (state.toRender.length === 0) await sleep(1);
      const canvasID = head(state.toRender);

      console.log('renderCanvas', canvasID);

      let updates = head(state.updates);
      while (!updates) {
        if (state.renderedTo >= state.to) {
          commit('updateCanvas', {
            canvasID,
            canvas: null,
          });
          return;
        }

        await dispatch('bufferUpdates');
        await sleep(1);
        updates = head(state.updates);
      }
      commit('consumeUpdate');
      dispatch('bufferUpdates');

      let size = state.canvasSize;
      if (state.resizings.length > 0) {
        const resizing = head(state.resizings);
        if (resizing.at <= updates.at) {
          size = resizing.size;
          commit('consumeResizing');
        }
      }

      const prevCanvasID = (canvasID + (state.canvases.length - 1)) % state.canvases.length;
      console.time('migrateCanvas');
      const canvas = migrateCanvas(
        state.canvases[prevCanvasID] && state.canvases[prevCanvasID].color, size);
      console.timeEnd('migrateCanvas');

      console.time('update canvas');
      for (let i = 0; i < updates.updates.length; i += 1) {
        const { x, y, color } = updates.updates[i];
        const colorArr = colorToByteArray(color);
        const cell = imageDataCell(canvas, x, y);
        canvas.data[cell] = colorArr[0];
        canvas.data[cell + 1] = colorArr[1];
        canvas.data[cell + 2] = colorArr[2];
        canvas.data[cell + 3] = colorArr[3];
      }
      console.timeEnd('update canvas');

      commit('markRendered');
      commit('updateCanvas', {
        canvasID,
        canvas: {
          at: state.renderedTo,
          color: canvas,
          consumed: false,
        },
      });

      dispatch('renderCanvas');
    },

    async bufferUpdates({ commit, dispatch, state }) {
      console.log('bufferUpdates');
      if (state.fetchingUpdates) return;
      if (state.updates.length >= state.updateBufSize) return;

      commit('setFetchingUpdates');

      const n = Math.ceil(1000 / state.interval);
      const start = last(state.updates) ? last(state.updates).at : state.renderedTo;
      const end = Math.min(state.to, start + (state.every * n));
      console.log(state.to, 'vs', start);
      console.log('fetching updates', n, 'from', start, 'to', end, 'every', state.every);
      console.log(state.updates.map(u => u.at));

      if (start >= end) return;

      const updates = await getUpdates(state.every, start, end);
      commit('saveUpdates', updates.data);
      commit('unsetFetchingUpdates');

      // in case too many updates consumed during the last fetching
      dispatch('bufferUpdates');
    },

    async showCanvas({ commit, dispatch, state }, canvasID) {
      console.log('showCanvas', canvasID);
      if (state.showedTo >= state.to) {
        return dispatch('finish');
      }
      while (!state.canvases[canvasID] || state.canvases[canvasID].consumed) {
        await sleep(1);
      }

      commit('setFrontCanvas', canvasID);
      const prevID = (canvasID + (state.canvases.length - 1)) % state.canvases.length;
      commit('addToRender', prevID);
      commit('updateCanvas', { canvasID, canvas: { consumed: true } });
      await sleep(state.interval);
      return dispatch('showCanvas', (canvasID + 1) % state.canvases.length);
    },

    finish({ commit }) {
      logger.info('playback finished');
      commit('setFrontCanvas', -1);
    },
  },
};
