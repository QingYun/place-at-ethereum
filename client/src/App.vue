<template>
  <div id="app" v-if="canvas">
    <Graph :width="500" :height="500" :margin="50">
      <CanvasMatrix />
    </Graph>
    <Graph :width="500" :height="500" :margin="50">
      <DifficultyMatrix />
    </Graph>
    <router-view></router-view>
  </div>
  <div v-else>
    loading...
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { prop } from 'ramda';
import Graph from './components/Graph';
import CanvasMatrix from './components/CanvasMatrix';
import DifficultyMatrix from './components/DifficultyMatrix';

export default {
  name: 'app',
  components: {
    Graph,
    CanvasMatrix,
    DifficultyMatrix,
  },
  computed: mapState({
    canvas: prop('canvas'),
  }),
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
