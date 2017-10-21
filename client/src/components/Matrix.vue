<template>
  <g>
    <g v-for="(row, rowIdx) in canvas" :key="`row_${rowIdx}`">
      <Pixel v-for="(color, colIdx) in row" :key="`pixel_${colIdx}_${rowIdx}`"
        :x="colIdx * pixelWidth" :y="rowIdx * pixelHeight" :color="color" 
        :width="pixelWidth" :height="pixelHeight"
        @click="drawPixel(rowIdx, colIdx)"
      />
    </g>
  </g>
</template>

<script>
import { mapState } from 'vuex';
import { prop, compose, map } from 'ramda';
import Pixel from './Pixel';
import { colorToRGB } from '../utils/color';
import draw from '../api/draw';

export default {
  name: 'Matrix',
  props: ['width', 'height'],
  components: {
    Pixel,
  },
  computed: {
    pixelWidth() {
      if (!this.canvas) return 0;
      return this.width / this.canvas[0].length;
    },
    pixelHeight() {
      if (!this.canvas) return 0;
      return this.height / this.canvas.length;
    },
    ...mapState({
      canvas: compose(map(map(compose(colorToRGB, prop('color')))), prop('canvas')),
    }),
  },
  methods: {
    drawPixel(x, y) {
      draw(x, y, 1);
    },
  },
};
</script>

<style>
</style>
