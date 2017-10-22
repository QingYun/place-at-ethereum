<template>
  <g>
    <g v-for="(row, rowIdx) in data" :key="`row_${rowIdx}`">
      <Pixel v-for="(color, colIdx) in row" :key="`pixel_${colIdx}_${rowIdx}`"
        :x="colIdx * pixelWidth" :y="rowIdx * pixelHeight" :color="color" 
        :width="pixelWidth" :height="pixelHeight"
        @click="onClick(rowIdx, colIdx)"
      />
    </g>
    <g v-if="crossLine !== null">
      <line class="cross" v-bind="crossLine.a"/>
      <line class="cross" v-bind="crossLine.b"/>
    </g>
  </g>
</template>

<script>
import Pixel from './Pixel';

export default {
  name: 'Matrix',
  props: ['width', 'height', 'data', 'onClick', 'selected'],
  components: {
    Pixel,
  },
  computed: {
    pixelWidth() {
      if (!this.data) return 0;
      return Math.floor(this.width / this.data[0].length);
    },
    pixelHeight() {
      if (!this.data) return 0;
      return Math.floor(this.height / this.data.length);
    },
    crossLine() {
      if (!this.selected || this.selected.x === -1) return null;
      const pw = this.pixelWidth;
      const ph = this.pixelHeight;
      const y = this.selected.x * ph;
      const x = this.selected.y * pw;
      return {
        a: {
          x1: x,
          y1: y,
          x2: x + pw,
          y2: y + ph,
        },
        b: {
          x1: x + pw,
          y1: y,
          x2: x,
          y2: y + ph,
        },
      };
    },
  },
};
</script>

<style>

.cross {
  stroke: red;
}

</style>
