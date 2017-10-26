<template>
  <Matrix 
    :data="matrix" 
    :onClick="onPixelClick"
    :selected="selected"
    v-bind="$props" />
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';
import { prop, compose, map } from 'ramda';
import Matrix from './Matrix';
import { colorToRGB } from '../utils/color';

export default {
  name: 'CanvasMatrix',
  props: ['width', 'height'],
  components: {
    Matrix,
  },
  computed: {
    matrix() {
      const matrix = map(map(compose(colorToRGB, prop('color'))))(this.matrixData);
      return matrix;
    },
    ...mapGetters({
      matrixData: 'canvas',
    }),
    ...mapState({
      selected: prop('selectedPixel'),
    }),
  },
  methods: {
    onPixelClick(x, y) {
      this.selectPixel({ x, y });
    },
    ...mapMutations(['selectPixel']),
  },
};
</script>

<style>
</style>