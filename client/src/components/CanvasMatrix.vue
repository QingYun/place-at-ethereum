<template>
  <Matrix 
    :imageData="imageData" 
    :onClick="onPixelClick"
    :selected="selected"
    v-bind="$props" />
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';
import { prop, map } from 'ramda';
import Matrix from './Matrix';

export default {
  name: 'CanvasMatrix',
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
  computed: {
    matrix() {
      const matrix = map(map(prop('color')))(this.matrixData);
      return matrix;
    },
    ...mapGetters({
      matrixData: 'canvas',
      imageData: 'colorImageData',
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