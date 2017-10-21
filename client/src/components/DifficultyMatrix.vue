<template>
  <Matrix 
    :data="matrix" 
    :onClick="onPixelClick"
    v-bind="$props" />
</template>

<script>
import { mapState } from 'vuex';
import { compose, map } from 'ramda';
import { scaleSequential } from 'd3-scale';
import { interpolateRdYlGn } from 'd3-scale-chromatic';
import Matrix from './Matrix';

const difficultyToRGB = scaleSequential(interpolateRdYlGn)
  .domain([30, 0]);

const INTERVAL = 10;
const calcDifficulty = t => ({ difficulty, paintedAt }) => {
  const d = Math.max(1, difficulty);
  return Math.max(0, d - Math.floor(((t - paintedAt) * d) / (2 * INTERVAL)));
};

export default {
  name: 'DifficultyMatrix',
  props: ['width', 'height'],
  created() {
    setInterval(() => { this.now = Date.now() / 1000; }, 1000);
  },
  components: {
    Matrix,
  },
  data: () => ({
    now: Date.now() / 1000,
  }),
  computed: mapState({
    matrix(state) {
      return map(map(compose(difficultyToRGB, calcDifficulty(this.now))))(state.canvas);
    },
  }),
  methods: {
    onPixelClick(x, y) {
      logger.trace('click difficulty matrix: (%d, %d)', x, y);
    },
  },
};
</script>

<style>
</style>