<template>
  <div :style="{ width: `${width}px`, height: `${height}px` }">
    <canvas 
      class="matrix-canvas" ref="front-canvas"
      :style="canvasStyle" 
      :width="frontCanvasWidth" 
      :height="frontCanvasHeight" />
    <canvas 
      class="back-canvas" ref="back-canvas"
      :width="backCanvasWidth" 
      :height="backCanvasHeight" />
  </div>
</template>

<script>
import Pixel from './Pixel';
// import { fillImageData } from '../utils/color';

export default {
  name: 'Matrix',
  props: {
    data: Array,
    imageData: ImageData,
    onClick: Function,
    selected: Object,
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
  data: () => ({
    refreshing: 0,
    frontCtx: null,
    backCtx: null,
  }),
  components: {
    Pixel,
  },
  computed: {
    canvasStyle() {
      if (!this.imageData) return {};

      const width = this.pixelWidth * this.imageData.width;
      const height = this.pixelHeight * this.imageData.height;
      const gapWidth = (this.idealWidth - width) / 2;
      const gapHeight = (this.idealHeight - height) / 2;
      console.log('canvas style changed');
      return {
        top: `${this.marginT + gapHeight}px`,
        left: `${this.marginL + gapWidth}px`,
        width: `${width}px`,
        height: `${height}px`,
      };
    },
    idealWidth() {
      return this.width - this.marginL - this.marginR;
    },
    idealHeight() {
      return this.height - this.marginT - this.marginB;
    },
    marginL() {
      return this.marginLeft || this.margin;
    },
    marginR() {
      return this.marginRight || this.margin;
    },
    marginB() {
      return this.marginBottom || this.margin;
    },
    marginT() {
      return this.marginTop || this.margin;
    },
    pixelWidth() {
      if (!this.imageData) return 0;
      return this.idealWidth / this.imageData.width;
    },
    pixelHeight() {
      if (!this.imageData) return 0;
      return this.idealHeight / this.imageData.height;
    },
    frontCanvasWidth() {
      if (!this.imageData) return 0;
      return this.imageData.width * this.pixelWidth;
    },
    frontCanvasHeight() {
      if (!this.imageData) return 0;
      return this.imageData.height * this.pixelHeight;
    },
    backCanvasWidth() {
      if (!this.imageData) return 0;
      return this.imageData.width;
    },
    backCanvasHeight() {
      if (!this.imageData) return 0;
      return this.imageData.height;
    },
  },
  mounted() {
    this.frontCtx = this.$refs['front-canvas'].getContext('2d');
    this.backCtx = this.$refs['back-canvas'].getContext('2d');
    this.updateCanvas();
  },
  methods: {
    updateCanvas() {
      if (!this.imageData) return;
      console.time('put image data');
      this.backCtx.putImageData(this.imageData, 0, 0);
      console.timeEnd('put image data');
      this.frontCtx.save();
      this.frontCtx.imageSmoothingEnabled = false;
      this.frontCtx.scale(this.pixelWidth, this.pixelHeight);
      console.time('draw canvas');
      this.frontCtx.drawImage(this.$refs['back-canvas'], 0, 0);
      console.timeEnd('draw canvas');
      this.frontCtx.restore();
    },
  },
  watch: {
    data() {
      console.log('drawing');
      this.updateCanvas();
    },
    canvasStyle() {
      clearTimeout(this.refreshing);
      this.refreshing = setTimeout(() =>
        this.updateCanvas()
      , 50);
    },
  },
};
</script>

<style>

.matrix-canvas {
  position: absolute;
}

.back-canvas {
  display: none;
}

</style>
