<template>
  <Matrix 
    :imageData="imageData" 
    :onClick="onPixelClick"
    :scale="scale"
    :viewCenter="viewCenter"
    v-bind="$props" />
</template>

<script>
import { mapGetters } from 'vuex';
import Matrix from './Matrix';

/*
const INTERVAL = 10;
const calcDifficulty = t => ({ difficulty, paintedAt }) => {
  const d = Math.max(1, difficulty);
  return Math.max(0, d - Math.floor(((t - paintedAt) * d) / (2 * INTERVAL)));
};
*/

export default {
  name: 'DifficultyMatrix',
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
  computed: mapGetters({
    imageData: 'difficultyImageData',
    scale: 'scale',
    viewCenter: 'viewCenter',
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