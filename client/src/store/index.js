import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    canvas: null,
  },
  mutations: {
    initCanvas(state, { canvas }) {
      state.canvas = canvas;
    },

    updatePixel(state, { x, y, color }) {
      const row = state.canvas[x];
      row[y] = color;
      state.canvas.splice(x, 1, row);
    },
  },
});
