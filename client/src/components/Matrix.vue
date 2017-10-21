<template>
  <g>
    <g v-for="(row, rowIdx) in data" :key="`row_${rowIdx}`">
      <Pixel v-for="(color, colIdx) in row" :key="`pixel_${colIdx}_${rowIdx}`"
        :x="colIdx * pixelWidth" :y="rowIdx * pixelHeight" :color="color" 
        :width="pixelWidth" :height="pixelHeight"
        @click="onClick(rowIdx, colIdx)"
      />
    </g>
  </g>
</template>

<script>
import Pixel from './Pixel';

export default {
  name: 'Matrix',
  props: ['width', 'height', 'data', 'onClick'],
  components: {
    Pixel,
  },
  computed: {
    pixelWidth() {
      if (!this.data) return 0;
      return this.width / this.data[0].length;
    },
    pixelHeight() {
      if (!this.data) return 0;
      return this.height / this.data.length;
    },
  },
};
</script>

<style>
</style>
