<template>
  <rect
    :x="x" :y="y"
    :width="width" :height="height"
    :fill="color"
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
