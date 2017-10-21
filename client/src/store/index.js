import Vue from 'vue';
import Vuex from 'vuex';
import { merge } from 'ramda';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    canvas: null,
  },
  mutations: {
    initCanvas(state, { canvas }) {
      state.canvas = canvas;
      console.log(canvas);
    },

    updatePixel(state, { x, y, attr }) {
      const row = state.canvas[x];
      row[y] = merge(row[y], attr);
      state.canvas.splice(x, 1, row);
    },
  },
});
