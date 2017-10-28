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
import { fillImageData, hexColorToByteArray } from '../utils/color';

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
        console.log(this.data[3].map(c => c.r));
        imageData = new ImageData(this.data.length, this.data.length);
        fillImageData(hexColorToByteArray, imageData.data, this.data);
      }
      this.backCtx.putImageData(imageData, 0, 0);
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
