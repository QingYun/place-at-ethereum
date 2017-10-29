<template>
  <div :style="{ width: `${width}px`, height: `${height}px` }">
    <div class="canvas-container" :style="canvasStyle">
      <v-touch 
        @pan="canvasPan" @panend="canvasPanEnd"
        @pinch="canvasPinch" @pinchend="canvasPinchEnd">
        <canvas 
          @click="canvasClick"
          class="matrix-canvas" ref="front-canvas"
          :width="frontCanvasWidth" 
          :height="frontCanvasHeight"
        />
      </v-touch>

      <canvas 
        class="back-canvas" ref="back-canvas"
        :width="backCanvasWidth" 
        :height="backCanvasHeight" />

      <svg
        v-if="selected && selected.x !== -1"
        class="selection"
        :style="selectionStyle"
      >
        <rect class="box" 
          :x="0" :y="0" :width="pixelWidth * scale" :height="pixelHeight * scale" 
          :style="{ strokeWidth: `${(pixelWidth * scale) / 10}px` }"
        />
        <rect class="shining" :x="0" :y="0" :width="pixelWidth * scale" :height="pixelHeight * scale" />
      </svg>
    </div>
  </div>
</template>

<script>
import Pixel from './Pixel';
import { fillImageData, hexColorToByteArray } from '../utils/color';

export default {
  name: 'Matrix',
  props: {
    data: Array,
    imageData: ImageData,
    onClick: Function,
    onPinch: Function,
    onPinchEnd: Function,
    onPan: Function,
    onPanEnd: Function,
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
    scale: {
      type: Number,
      default: 1,
      require: false,
    },
    viewCenter: {
      type: Object,
      default: () => ({ x: 0.5, y: 0.5 }),
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
      const data = this.imageData || this.data;
      if (!data) return 0;

      const width = this.pixelWidth * (data.width || data.length);
      const height = this.pixelHeight * (data.height || data.length);
      return {
        top: `${this.marginT}px`,
        left: `${this.marginL}px`,
        width: `${width}px`,
        height: `${height}px`,
      };
    },
    selectionStyle() {
      if (!this.selected || this.selected.x === -1) return {};

      const top = this.pixelHeight * this.selected.y * this.scale;
      const left = this.pixelWidth * this.selected.x * this.scale;

      const { x, y } = this.contentPosition;
      const hOffset = x * this.frontCanvasWidth * this.scale;
      const vOffset = y * this.frontCanvasHeight * this.scale;

      return {
        top: `${top - vOffset}px`,
        left: `${left - hOffset}px`,
        width: `${this.pixelWidth * this.scale}px`,
        height: `${this.pixelHeight * this.scale}px`,
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
      const data = this.imageData || this.data;
      if (!data) return 0;
      return this.idealWidth / (data.width || data.length);
    },
    pixelHeight() {
      const data = this.imageData || this.data;
      if (!data) return 0;
      return this.idealHeight / (data.height || data.length);
    },
    frontCanvasWidth() {
      const data = this.imageData || this.data;
      if (!data) return 0;
      return (data.width || data.length) * this.pixelWidth;
    },
    frontCanvasHeight() {
      const data = this.imageData || this.data;
      if (!data) return 0;
      return (data.height || data.length) * this.pixelHeight;
    },
    backCanvasWidth() {
      const data = this.imageData || this.data;
      if (!data) return 0;
      return data.width || data.length;
    },
    backCanvasHeight() {
      const data = this.imageData || this.data;
      if (!data) return 0;
      return data.height || data.length;
    },
    contentPosition() {
      return {
        x: this.viewCenter.x - (1 / (2 * this.scale)),
        y: this.viewCenter.y - (1 / (2 * this.scale)),
      };
    },
  },
  mounted() {
    this.frontCtx = this.$refs['front-canvas'].getContext('2d');
    this.backCtx = this.$refs['back-canvas'].getContext('2d');
    this.updateCanvas();
  },
  methods: {
    updateCanvas() {
      let imageData = this.imageData;
      if (!imageData) {
        if (!this.data) return;
        imageData = new ImageData(this.data.length, this.data.length);
        fillImageData(hexColorToByteArray, imageData.data, this.data);
      }
      this.backCtx.putImageData(imageData, 0, 0);
      this.redrawCanvas();
    },

    redrawCanvas() {
      this.frontCtx.save();
      this.frontCtx.imageSmoothingEnabled = false;

      const sw = this.pixelWidth * this.scale;
      const sh = this.pixelHeight * this.scale;
      this.frontCtx.scale(sw, sh);

      const { x, y } = this.contentPosition;
      const sx = x * this.backCanvasWidth;
      const sy = y * this.backCanvasHeight;
      this.frontCtx.drawImage(this.$refs['back-canvas'], -sx, -sy);

      this.frontCtx.restore();
    },

    canvasClick({ offsetX, offsetY }) {
      this.onClick(
        Math.floor(offsetX / this.pixelWidth),
        Math.floor(offsetY / this.pixelHeight),
      );
    },

    canvasPan(e) {
      if (this.onPan) {
        this.onPan(
          e.deltaX / this.frontCanvasWidth,
          e.deltaY / this.frontCanvasHeight);
      }
    },

    canvasPanEnd(e) {
      if (this.onPanEnd) {
        this.onPanEnd(
          e.deltaX / this.frontCanvasWidth,
          e.deltaY / this.frontCanvasHeight);
      }
    },

    canvasPinch(e) {
      if (this.onPinch) {
        this.onPinch(e.scale, {
          x: e.center.x / this.frontCanvasWidth,
          y: e.center.y / this.frontCanvasHeight,
        });
      }
    },

    canvasPinchEnd(e) {
      if (this.onPinchEnd) {
        this.onPinchEnd(e.scale, {
          x: e.center.x / this.frontCanvasWidth,
          y: e.center.y / this.frontCanvasHeight,
        });
      }
    },
  },
  watch: {
    data() {
      this.updateCanvas();
    },
    scale() {
      this.redrawCanvas();
    },
    viewCenter() {
      this.redrawCanvas();
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

.canvas-container {
  position: absolute;
  overflow: hidden;
}

.back-canvas {
  display: none;
}

@keyframes show-selection {
  0%    { fill: rgba(255, 255, 255, 0); }
  50%   { fill: rgba(255, 255, 255, .8); }
  100%  { fill: rgba(255, 255, 255, 0); }
}

.selection {
  position: absolute;
}

.selection .shining {
  animation: show-selection 2s infinite;
}

.selection .box {
  stroke: black;
  fill: rgba(0,0,0,0);
}

</style>
