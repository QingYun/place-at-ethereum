<template>
  <Matrix 
    :data="matrix" 
    :onClick="onPixelClick"
    :selected="selected"
    v-bind="$props" />
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { prop, compose, map } from 'ramda';
import Matrix from './Matrix';
import { colorToRGB } from '../utils/color';

export default {
  name: 'CanvasMatrix',
  props: ['width', 'height'],
  components: {
    Matrix,
  },
  computed: mapState({
    matrix: compose(map(map(compose(colorToRGB, prop('color')))), prop('canvas')),
    selected: prop('selectedPixel'),
  }),
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