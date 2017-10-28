<template>
  <div class="pixel-card" ref="card">
    <Matrix 
      :style="matrixStyle"
      :data="colors" :onClick="onSelectColor" :selected="selectedColor" 
      :width="graphSize" :height="graphSize" :margin="50" v-if="graphSize > 0"
    />

    <div class="buttons" :class="{ active: isActive }" ref="buttons">
      <h1 class="cancel" @click="cancelSelection">Cancel</h1><h1 class="draw" @click="drawPixel">Draw</h1>
    </div>

  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex';
import { prop, splitEvery } from 'ramda';
import Graph from './Graph';
import Matrix from './Matrix';
import { draw } from '../api';
import { colors } from '../utils/color';

export default {
  name: 'PixelCard',
  components: {
    Graph, Matrix,
  },
  data: () => ({
    activeTab: 0,
    isMounted: false,
    selectedColor: null,
    colors: splitEvery(4, colors),
  }),
  computed: {
    graphSize() {
      if (!this.isMounted || !this.pixel || this.pixel.x === -1) return 0;
      return Math.min(
        this.$refs.card.clientWidth,
        this.$refs.card.clientHeight - this.$refs.buttons.clientHeight,
      );
    },
    matrixStyle() {
      if (this.graphSize <= 0) return {};
      return {
        marginLeft: `${(this.$refs.card.clientWidth - this.graphSize) / 2}px`,
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
    async cardClick() {
      await this.startPlayback({
        from: 0,
        to: 1491174984000,
        interval: 100,
        duration: 10 * 1000,
      });
      console.log('finished from component');
    },
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
    ...mapActions(['startPlayback']),
  },
  mounted() {
    this.isMounted = true;
  },
};
</script>

<style>

.pixel-card {
  position: absolute;
  background-color: #333;
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