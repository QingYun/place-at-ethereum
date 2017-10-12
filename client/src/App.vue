<template>
  <div id="app">
    <Graph :width="500" :height="500" :margin="50">
      <rect></rect>
    </Graph>
    <router-view></router-view>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Graph from './components/Graph';

export default {
  name: 'app',
  components: {
    Graph,
  },
  computed: mapState(['canvas']),
  mounted() { console.log('App mounted!'); },
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
