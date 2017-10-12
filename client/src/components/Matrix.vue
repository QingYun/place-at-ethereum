<template>
  <g>
    <g v-for="(row, y) in canvas" :key="`row_${y}`">
      <Pixel v-for="(color, x) in row" :key="`pixel_${x}_${y}`"
        :x="x * pixelWidth" :y="y * pixelHeight" :color="color" 
        :width="pixelWidth" :height="pixelHeight"
      />
    </g>
  </g>
</template>

<script>
import { mapState } from 'vuex';
import Pixel from './Pixel';
import { colorToRGB } from '../utils/color';

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
      canvas(state) {
        return state.canvas.map(row => row.map(colorToRGB));
      },
    }),
  },
};
</script>

<style>
</style>
