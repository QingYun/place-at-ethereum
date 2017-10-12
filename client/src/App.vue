<template>
  <div id="app" v-if="canvas">
    <Graph :width="500" :height="500" :margin="50">
      <Matrix />
    </Graph>
    <router-view></router-view>
  </div>
  <div v-else>
    loading...
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Graph from './components/Graph';
import Matrix from './components/Matrix';

export default {
  name: 'app',
  components: {
    Graph,
    Matrix,
  },
  computed: mapState(['canvas']),
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
