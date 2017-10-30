<template>
  <div class="container" ref="container">
    <Matrix 
      :style="matrixStyle"
      :data="colors" :onClick="onSelectColor" :selected="selectedColor" :scale="1"
      :width="graphSize" :height="graphSize" :margin="50" 
    />

    <div class="buttons" :class="{ active: isActive }" ref="buttons">
      <h1 class="cancel" @click="cancelSelection">Cancel</h1><h1 class="draw" @click="drawPixel">Draw</h1>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { prop, splitEvery } from 'ramda';
import Graph from './Graph';
import Matrix from './Matrix';
import { draw } from '../api';
import { colors } from '../utils/color';


export default {
  name: 'DrawingControls',
  components: {
    Graph, Matrix,
  },
  data: () => ({
    isMounted: false,
    selectedColor: null,
    colors: splitEvery(4, colors),
  }),
  computed: {
    graphSize() {
      if (!this.isMounted || !this.pixel || this.pixel.x === -1) return 0;
      return Math.min(
        this.$refs.container.clientWidth,
        this.$refs.container.clientHeight - this.$refs.buttons.clientHeight,
      );
    },
    matrixStyle() {
      if (this.graphSize <= 0) return {};
      return {
        marginLeft: `${(this.$refs.container.clientWidth - this.graphSize) / 2}px`,
        position: 'absolute',
      };
    },
    isActive() {
      return this.pixel.x !== -1;
    },
    ...mapState({
      pixel: prop('selectedPixel'),
    }),
  },
  methods: {
    onSelectColor(x, y) {
      this.selectedColor = { x, y };
    },
    drawPixel() {
      const { x, y } = this.selectedColor;
      draw(this.pixel.x, this.pixel.y, (y * 4) + x);
      this.cancelSelection();
    },
    cancelSelection() {
      this.cancelPixelSelection();
      this.selectedColor = null;
    },
    ...mapMutations(['cancelPixelSelection']),
  },
  mounted() {
    this.isMounted = true;
  },
};
</script>

<style>

.container {
  width: 100%;
  height: 100%;
}

.buttons {
  position: absolute;
  color: #888888;
  width: 100%;
  bottom: 0;
}

.buttons.active {
  color: #cccccc;
}

.buttons h1 {
  width: 50%;
  text-align: center;
  display: inline-block;
  font-size: 1.5rem;
  padding: .5rem;
}

.buttons.active .cancel {
  background-color: #ff3860;
}

.buttons .cancel {
  background-color: #7F1C2F;
}

.buttons.active .draw {
  background-color: #23d160;
}

.buttons .draw {
  background-color: #157F3A;
}

</style>