import sleep from 'sleep-promise';
import { repeat, head, tail, last } from 'ramda';
import { getUpdates, getResizings } from '../api';

function makeCanvas(size) {
  return repeat(repeat(0, size), size);
}

function migrateCanvas(prev, size) {
  if (prev === null) return makeCanvas(size);
  if (prev.length === size) return prev;

  const canvas = makeCanvas(size);
  const offset = (size - prev.length) / 2;
  prev.forEach((row, x) => row.forEach((color, y) => {
    canvas[x + offset][y + offset] = color;
  }));
  return canvas;
}

export default {
  namespaced: true,
  state: {
    frontCanvas: -1,
  },
  getters: {
    canvas(state) {
      if (state.frontCanvas === -1) return [[]];
      return state.canvases[state.frontCanvas];
    },
  },
  mutations: {
    init(state, { from, to, interval, duration, updateBufSize, canvasBufSize }) {
      state.interval = interval;
      state.duration = duration;
      state.renderedTo = from / 1000;
      state.from = from / 1000;
      state.to = to / 1000;
      state.every = (state.to - state.from) / (duration / interval);

      state.updateBufSize = updateBufSize;
      state.updates = [];

      state.frontCanvas = -1;
      state.canvasSize = 0;
      state.canvases = repeat(null, canvasBufSize);

      state.fetchingUpdates = false;
    },

    saveUpdates(state, updates) {
      state.updates.push(...updates);
    },

    consumeUpdate(state) {
      state.renderedTo = head(state.updates).at;
      state.updates = tail(state.updates);
    },

    saveResizings(state, resizings) {
      state.resizings = resizings;
    },

    consumeResizing(state) {
      state.canvasSize = head(state.resizings).size;
      state.resizings = tail(state.resizings);
    },

    updateCanvas(state, { canvasID, canvas }) {
      state.canvases.splice(canvasID, 1, canvas);
    },

    setFrontCanvas(state, canvasID) {
      console.log(canvasID);
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

      const { updateBufSize, canvasBufSize } = payload;
      const end = Math.min(state.to, state.from + (state.every * updateBufSize));

      const [updates, resizings] = await Promise.all([
        getUpdates(state.every, state.from, end),
        getResizings(state.from, state.to),
      ]);

      commit('saveUpdates', updates.data);
      commit('saveResizings', resizings.data);
      // make sure there's a blank canvas buffer to draw after the each rendering
      for (let i = 0; i < canvasBufSize - 1; i += 1) {
        await dispatch('renderCanvas', i); // eslint-disable-line no-await-in-loop
      }

      return dispatch('showCanvas', 0);
    },

    async renderCanvas({ commit, dispatch, state }, canvasID) {
      console.log('renderCanvas', canvasID);
      if (state.renderedTo >= state.to) {
        commit('updateCanvas', {
          canvasID,
          canvas: null,
        });
        return;
      }

      const updates = head(state.updates);
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
      const canvas = migrateCanvas(state.canvases[prevCanvasID], size);

      updates.updates.forEach(({ x, y, color }) => {
        canvas[x][y] = color;
      });

      commit('updateCanvas', {
        canvas, canvasID,
      });
    },

    async bufferUpdates({ commit, dispatch, state }) {
      console.log('bufferUpdates');
      if (state.fetchingUpdates) return;
      if (state.updates.length >= state.updateBufSize) return;

      commit('setFetchingUpdates');

      // buffer three second data
      const n = Math.ceil(1000 / state.interval);
      const start = last(state.updates).at;
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
      if (state.canvases[canvasID] === null) {
        return dispatch('finish');
      }

      commit('setFrontCanvas', canvasID);
      const prevID = (canvasID + (state.canvases.length - 1)) % state.canvases.length;
      dispatch('renderCanvas', prevID);
      await sleep(state.interval);
      return dispatch('showCanvas', (canvasID + 1) % state.canvases.length);
    },

    finish({ commit }) {
      logger.info('playback finished');
      commit('setFrontCanvas', -1);
    },
  },
};
