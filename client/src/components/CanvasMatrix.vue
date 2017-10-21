<template>
  <Matrix 
    :data="matrix" 
    :onClick="onPixelClick"
    v-bind="$props" />
</template>

<script>
import { mapState } from 'vuex';
import { prop, compose, map } from 'ramda';
import Matrix from './Matrix';
import { colorToRGB } from '../utils/color';
import draw from '../api/draw';

export default {
  name: 'CanvasMatrix',
  props: ['width', 'height'],
  components: {
    Matrix,
  },
  computed: mapState({
    matrix: compose(map(map(compose(colorToRGB, prop('color')))), prop('canvas')),
  }),
  methods: {
    onPixelClick(x, y) {
      draw(x, y, 1);
    },
  },
};
</script>

<style>
</style>