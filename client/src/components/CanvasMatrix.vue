<template>
  <Matrix 
    :imageData="imageData" 
    :onClick="onPixelClick"
    :onPinch="zoomCanvas"
    :onPinchEnd="setBaseScale"
    :onPan="moveView"
    :onPanEnd="setViewCenter"
    :selected="selected"
    :scale="scale"
    :viewCenter="viewCenter"
    v-bind="$props" />
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';
import { prop, map, clamp } from 'ramda';
import Matrix from './Matrix';

export default {
  name: 'CanvasMatrix',
  props: {
    width: Number,
    height: Number,
    marginLeft: Number,
    marginRight: Number,
    marginTop: Number,
    marginBottom: Number,
    margin: {
      type: Number,
      default: 0,
      require: false,
    },
  },
  components: {
    Matrix,
  },
  computed: {
    matrix() {
      const matrix = map(map(prop('color')))(this.matrixData);
      return matrix;
    },
    ...mapGetters({
      matrixData: 'canvas',
      imageData: 'colorImageData',
      scale: 'scale',
      viewCenter: 'viewCenter',
    }),
    ...mapState({
      selected: prop('selectedPixel'),
      view: prop('view'),
      playback: prop('useSandbox'),
    }),
  },
  methods: {
    onPixelClick(x, y) {
      if (!this.playback) {
        this.selectPixel({ x, y });
      }
    },
    zoomCanvas(scale, center) {
      this.setView({
        center,
        scale: Math.max(scale, 1 / this.view.baseScale),
      });
    },
    setBaseScale(scale, center) {
      this.setView({
        center,
        baseScale: Math.max(1, this.view.baseScale * scale),
        scale: 1,
      });
    },
    moveView(dx, dy) {
      const min = 1 / (2 * this.scale);
      const max = ((2 * this.scale) - 1) / (2 * this.scale);
      const { x, y } = this.view.center;
      this.setView({
        deltaCenter: {
          x: clamp(x - max, x - min, dx),
          y: clamp(y - max, y - min, dy),
        },
      });
    },
    setViewCenter(dx, dy) {
      const min = 1 / (2 * this.scale);
      const max = ((2 * this.scale) - 1) / (2 * this.scale);
      this.setView({
        center: {
          x: clamp(min, max, this.view.center.x - dx),
          y: clamp(min, max, this.view.center.y - dy),
        },
        deltaCenter: { x: 0, y: 0 },
      });
    },
    ...mapMutations(['selectPixel', 'setView']),
  },
  watch: {
    viewCenter() {
      console.log('view Center', this.scale, this.viewCenter);
    },
  },
};
</script>

<style>
</style>