<template>
  <div id="app" v-if="canvas" :style="appStyle">
    <Graph 
      id="canvas-matrix" 
      :width="canvasMatrixSize.width" 
      :height="canvasMatrixSize.height" 
      :margin="30"
      :marginRight="15"
      :style="{ top: '0', left: '0' }">
      <CanvasMatrix />
    </Graph>
    <Graph 
      id="difficulty-matrix" 
      :width="difficultyMatrixSize.width" 
      :height="difficultyMatrixSize.height" 
      :margin="30"
      :marginLeft="15"
      :style="{ top: '0', right: '0' }">
      <DifficultyMatrix />
    </Graph>
    <PixelCard :style="{ right: '30px', bottom: '30px', height: pixelCardSize.height, width: pixelCardSize.width }" />
    <router-view></router-view>
  </div>
  <div v-else>
    loading...
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { prop, map } from 'ramda';
import Graph from './components/Graph';
import CanvasMatrix from './components/CanvasMatrix';
import DifficultyMatrix from './components/DifficultyMatrix';
import PixelCard from './components/PixelCard';

const toPx = map(n => `${n}px`);

export default {
  name: 'app',
  created() {
    window.addEventListener('resize', this.getWindowSize);
  },
  data: () => ({
    windowSize: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  }),
  components: {
    Graph,
    CanvasMatrix,
    DifficultyMatrix,
    PixelCard,
  },
  computed: {
    // To keep the app in a 3:2 ratio
    appStyleN() {
      const { width: ww, height: wh } = this.windowSize;
      let idealHeight = wh;
      let idealWidth = (idealHeight / 2) * 3;

      if (idealWidth > ww) {
        // The window isn't wide enough, we shrink the height to fit
        idealWidth = ww;
        idealHeight = (ww / 3) * 2;
      }

      return {
        width: idealWidth,
        height: idealHeight,
        top: (wh - idealHeight) / 2,
        left: (ww - idealWidth) / 2,
      };
    },
    appStyle() {
      return toPx(this.appStyleN);
    },
    canvasMatrixSize() {
      const h = Math.floor(this.appStyleN.height);
      return {
        height: h,
        width: h,
      };
    },
    difficultyMatrixSize() {
      const w = Math.floor(this.appStyleN.width - this.canvasMatrixSize.width);
      return {
        height: w,
        width: w,
      };
    },
    pixelCardSize() {
      const h = Math.floor(this.appStyleN.height - this.difficultyMatrixSize.height);
      return toPx({
        width: this.difficultyMatrixSize.width - 45,
        height: h - 30,
      });
    },
    ...mapState({
      canvas: prop('canvas'),
    }),
  },
  methods: {
    getWindowSize() {
      this.windowSize.width = window.innerWidth;
      this.windowSize.height = window.innerHeight;
    },
  },
};
</script>

<style>

html {
  overflow: hidden;
  background-color: #222;
}

body {
  margin: 0;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  position: absolute;
}

#canvas-matrix {
  position: absolute;
}

#difficulty-matrix {
  position: absolute;
}

</style>
