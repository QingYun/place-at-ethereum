import Vue from 'vue';
import Vuex from 'vuex';
import { merge } from 'ramda';
import sandbox from './sandbox';
import { colorToByteArray, fillImageData } from '../utils/color';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    useSandbox: false,
    canvas: null,
    selectedPixel: {
      x: -1,
      y: -1,
    },
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
        return getters['sandbox/canvas'];
      }
      const imageData = new ImageData(state.canvas.length, state.canvas.length);
      fillImageData(p => colorToByteArray(p.color), imageData.data, state.canvas);
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

  },
  actions: {
    async startPlayback({ commit, dispatch }, payload) {
      commit('useSandbox', true);
      await dispatch('sandbox/init', payload);
      commit('useSandbox', false);
    },
  },
});
