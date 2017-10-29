import sleep from 'sleep-promise';
import { repeat, head, tail, last, range, merge, times } from 'ramda';
import { getUpdates, getResizings } from '../api';
import { colorToByteArray, difficultyColors } from '../utils/color';

function imageDataCell(data, x, y) {
  return (y * data.width * 4) + (x * 4);
}

function makeCanvas(size, fill) {
  return new ImageData(new Uint8ClampedArray(repeat(fill, size * size * 4)), size, size);
}

function migrateCanvas(prev, size, fill) {
  if (prev === null) return makeCanvas(size, fill);
  if (prev.width === size) {
    const canvas = new ImageData(size, size);
    canvas.data.set(prev.data);
    return canvas;
  }

  const canvas = makeCanvas(size, fill);

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

// An array to hold the state of the game at the time of the last frame.
// Since rendering is single-threaded and ordered, just one such buffer is enough.
let matrix = null;

function matrixElm(size, x, y) {
  return (y * size) + x;
}

function resizeMatrix(size) {
  if (matrix && matrix.length === size * size) return;

  const newMatrix = times(() => ({
    paintedAt: 0,
    difficulty: 0,
  }), size * size);

  if (!matrix) {
    matrix = newMatrix;
    return;
  }

  const oldSize = Math.sqrt(matrix.length);
  const offset = oldSize - size;

  for (let x = 0; x < oldSize; x += 1) {
    for (let y = 0; y < oldSize; y += 1) {
      const cell = matrix[matrixElm(oldSize, x, y)];
      newMatrix[matrixElm(size, x + offset, y + offset)] = {
        paintedAt: cell.paintedAt,
        difficulty: cell.difficulty,
      };
    }
  }

  matrix = newMatrix;
}

export default {
  namespaced: true,
  state: {
    frontCanvas: -1,
  },
  getters: {
    colorImageData(state) {
      if (state.frontCanvas === -1) return null;
      return state.canvases[state.frontCanvas].color;
    },
    difficultyImageData(state) {
      if (state.frontCanvas === -1) return null;
      return state.canvases[state.frontCanvas].difficulty;
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

      state.waitTime = (4000 / state.interval) * state.every;

      state.frontCanvas = -1;
      state.canvasSize = 0;
      state.showedTo = state.from;
      state.canvases = repeat(null, Math.max(2, 1000 / interval));
      state.toRender = range(0, state.canvases.length - 1);

      state.updateBufSize = state.canvases.length * 5;
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
      const prevCanvas = state.canvases[prevCanvasID];

      resizeMatrix(size);
      const colorCanvas = migrateCanvas(prevCanvas && prevCanvas.color, size, 255);
      const difficultyCanvas = migrateCanvas(prevCanvas && prevCanvas.difficulty, size, 0);

      console.time('render color + update difficulty');
      for (let i = 0; i < updates.updates.length; i += 1) {
        const { x, y, color } = updates.updates[i];

        // render color
        const colorArr = colorToByteArray(color);
        const cell = imageDataCell(colorCanvas, x, y);
        colorCanvas.data[cell] = colorArr[0];
        colorCanvas.data[cell + 1] = colorArr[1];
        colorCanvas.data[cell + 2] = colorArr[2];
        colorCanvas.data[cell + 3] = colorArr[3];

        // update difficulty
        const xl = Math.max(0, x - 3);
        const xh = Math.min(size, x + 4);
        const yl = Math.max(0, y - 3);
        const yh = Math.min(size, y + 4);
        for (let j = xl; j < xh; j += 1) {
          for (let k = yl; k < yh; k += 1) {
            const elm = matrix[matrixElm(size, j, k)];
            const t = updates.at - elm.paintedAt;
            const dis = Math.max(Math.abs(x - j), Math.abs(y - k));
            const inc = 4 - dis;
            let newDifficulty = 0;
            if (elm.difficulty > 0 && t < state.waitTime) {
              const d = elm.difficulty;
              newDifficulty = Math.max(0, d - Math.floor((t * d) / state.waitTime));
            }
            elm.difficulty = Math.min(255, newDifficulty + inc);
            elm.paintedAt = updates.at;
          }
        }
      }
      console.timeEnd('render color + update difficulty');
      if (updates.updates.length < 100) console.log('wired updates', updates);

      console.time('render difficulty');
      // render difficulty
      for (let i = 0; i < matrix.length; i += 1) {
        if (matrix[i].paintedAt === updates.at) {
          const cell = i * 4;
          const colorArr = difficultyColors[matrix[i].difficulty];
          difficultyCanvas.data[cell] = colorArr[0];
          difficultyCanvas.data[cell + 1] = colorArr[1];
          difficultyCanvas.data[cell + 2] = colorArr[2];
          difficultyCanvas.data[cell + 3] = colorArr[3];
        }
      }
      console.timeEnd('render difficulty');

      commit('markRendered');
      commit('updateCanvas', {
        canvasID,
        canvas: {
          at: updates.at,
          color: colorCanvas,
          difficulty: difficultyCanvas,
          consumed: false,
        },
      });

      dispatch('renderCanvas');
    },

    async bufferUpdates({ commit, dispatch, state }) {
      if (state.fetchingUpdates) return;
      if (state.updates.length >= state.updateBufSize) return;

      commit('setFetchingUpdates');

      const n = Math.ceil(1000 / state.interval);
      const start = last(state.updates) ? last(state.updates).at : state.renderedTo;
      const end = Math.min(state.to, start + (state.every * n));
      console.log('fetching updates', n, 'from', start, 'to', end, 'every', state.every);

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
