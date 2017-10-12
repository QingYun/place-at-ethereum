<template>
  <rect
    :x="x" :y="y"
    :width="width" :height="height"
    :fill="color"

    @click="$emit('click')"
  />
</template>

<script>
export default {
  name: 'Pixel',
  props: ['x', 'y', 'width', 'height', 'color'],
};
</script>

<style>
</style>
