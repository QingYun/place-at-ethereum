<template>
  <div :style="{ width: `${width}px`, height: `${height}px` }">
    <canvas 
      @click="canvasClick"
      class="matrix-canvas" ref="front-canvas"
      :style="canvasStyle" 
      :width="frontCanvasWidth" 
      :height="frontCanvasHeight"
    />

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
        :x="0" :y="0" :width="pixelWidth" :height="pixelHeight" 
        :style="{ strokeWidth: `${pixelWidth / 10}px` }"
      />
      <rect class="shining" :x="0" :y="0" :width="pixelWidth" :height="pixelHeight" />
    </svg>
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
      return {
        top: `${this.marginT}px`,
        left: `${this.marginL}px`,
        width: `${width}px`,
        height: `${height}px`,
      };
    },
    selectionStyle() {
      if (!this.selected || this.selected.x === -1) return {};

      const top = this.pixelHeight * this.selected.y;
      const left = this.pixelWidth * this.selected.x;

      return {
        top: `${top + this.marginT}px`,
        left: `${left + this.marginL}px`,
        width: `${this.pixelWidth}px`,
        height: `${this.pixelHeight}px`,
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
      this.backCtx.putImageData(this.imageData, 0, 0);
      this.frontCtx.save();
      this.frontCtx.imageSmoothingEnabled = false;
      this.frontCtx.scale(this.pixelWidth, this.pixelHeight);
      this.frontCtx.drawImage(this.$refs['back-canvas'], 0, 0);
      this.frontCtx.restore();
    },

    canvasClick({ offsetX, offsetY }) {
      this.onClick(
        Math.floor(offsetX / this.pixelWidth),
        Math.floor(offsetY / this.pixelHeight),
      );
    },
  },
  watch: {
    data() {
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
