<template>
  <svg :width="width" :height="height">
    <g :transform="`translate(${marginL}, ${marginT})`">
      <SlotWithProps 
        :width="width - marginL- marginR"
        :height="height - marginT- marginB"
      >
        <slot></slot>
      </SlotWithProps>
    </g>
  </svg>
</template>

<script>
import SlotWithProps from '../utils/slot-with-props';

export default {
  name: 'Graph',
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
    SlotWithProps,
  },
  computed: {
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
  },
};
</script>

<style>
</style>
