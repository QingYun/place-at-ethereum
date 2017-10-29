import Vue from 'vue';
import Vuex from 'vuex';
import { merge } from 'ramda';
import sleep from 'sleep-promise';
import sandbox from './sandbox';
import { colorToByteArray, difficultyToByteArray, fillImageData } from '../utils/color';
import calcDifficulty from '../utils/calc-difficulty';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    useSandbox: false,
    canvas: null,
    selectedPixel: {
      x: -1,
      y: -1,
    },
    refreshDifficultyUntil: 0,
  },
  modules: {
    sandbox,
  },
  getters: {
    canvas(state, getters) {
      if (state.useSandbox) {
        return getters['sandbox/canvas'];
      }
      return state.canvas;
    },

    colorImageData(state, getters) {
      if (state.useSandbox) {
        return getters['sandbox/colorImageData'];
      }
      const imageData = new ImageData(state.canvas.length, state.canvas.length);
      fillImageData(p => colorToByteArray(p.color), imageData.data, state.canvas);
      return imageData;
    },

    difficultyImageData(state, getters) {
      if (state.useSandbox) {
        return getters['sandbox/difficultyImageData'];
      }
      const imageData = new ImageData(state.canvas.length, state.canvas.length);
      fillImageData(p => difficultyToByteArray(p.difficulty), imageData.data, state.canvas);
      return imageData;
    },
  },
  mutations: {
    initCanvas(state, { canvas }) {
      state.canvas = canvas;
    },

    updatePixel(state, { x, y, attr }) {
      const row = state.canvas[x];
      row[y] = merge(row[y], attr);
      state.canvas.splice(x, 1, row);
    },

    selectPixel(state, selection) {
      state.selectedPixel = selection;
    },

    cancelPixelSelection(state) {
      state.selectedPixel.x = -1;
      state.selectedPixel.y = -1;
    },

    useSandbox(state, flag) {
      state.useSandbox = flag;
    },

    refreshDifficultyUntil(state, t) {
      state.refreshDifficultyUntil = t;
    },

    refreshDifficulty(state) {
      const t = Date.now() / 1000;
      const canvas = state.canvas;
      const newCanvas = new Array(canvas.length);
      for (let rowIdx = 0; rowIdx < canvas.length; rowIdx += 1) {
        const row = new Array(canvas[rowIdx].length);
        for (let colIdx = 0; colIdx < canvas[rowIdx].length; colIdx += 1) {
          const cell = canvas[rowIdx][colIdx];
          row[colIdx] = cell;
          if (cell.difficulty !== 0) {
            cell.difficulty = calcDifficulty(cell.difficulty, cell.paintedAt, t);
          }
        }
        newCanvas[rowIdx] = row;
      }
      state.canvas = newCanvas;
    },
  },
  actions: {
    startRefreshingDifficulty({ commit, dispatch, state }) {
      const refreshing = Date.now() < state.refreshDifficultyUntil;
      commit('refreshDifficultyUntil', Date.now() + (21 * 1000));
      if (!refreshing) dispatch('refreshDifficulty');
    },

    async refreshDifficulty({ commit, dispatch, state }) {
      if (Date.now() > state.refreshDifficultyUntil) return;
      commit('refreshDifficulty');
      await sleep(1000);
      dispatch('refreshDifficulty');
    },

    async startPlayback({ commit, dispatch }, payload) {
      commit('useSandbox', true);
      await dispatch('sandbox/init', payload);
      commit('useSandbox', false);
    },
  },
});
