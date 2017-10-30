<template>
  <div class="pixel-card" ref="card">
    <div v-if="useSandbox && !isPlaying">
      <div class="section">
        <h1 class="is-large">loading...</h1>
      </div>
    </div>
    <div v-if="!useSandbox && selectedPixel.x === -1">
      <div class="section">
        <h1 class="instruction">Select a pixel on the left</h1>
        <h3 class="sub-instruction">or</h3>
        <h1 class="instruction">Choose a playback below</h1>
        <div class="buttons">
          <span class="button is-black" :class="{ 'is-outlined': duration !== 10 }" @click="playFast">Fast</span>
          <span class="button is-black" :class="{ 'is-outlined': duration !== 30 }" @click="playNormal">Normal</span>
          <span class="button is-black" :class="{ 'is-outlined': duration !== 60 }" @click="playSlow">Slow</span>
        </div>
        <a class="button is-outlined is-danger" @click="theWholeProcess">The Whole Process</a>
        <a class="button is-outlined is-primary" @click="osu">The War of Osu!</a>
        <a class="button is-outlined is-success" @click="EUFlag">The Formation of EU flag</a>
        <a class="button is-outlined is-danger" @click="theVoid">The Void</a>
        <a class="button is-outlined is-info" @click="blueCorner">The Blue Corner</a>
        <a class="button is-outlined is-warning" @click="USFlag">The US Flag</a>
      </div>
    </div>
    <DrawingControls v-if="!useSandbox && selectedPixel.x !== -1" />
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex';
import DrawingControls from './DrawingControls';

export default {
  name: 'PixelCard',
  components: {
    DrawingControls,
  },
  mounted() {
    setInterval(() => {
      if (this.selectedPixel.x !== -1) return;
      if (this.useSandbox) return;
      this.theWholeProcess();
    }, 60000);
  },
  data: () => ({
    duration: 30,
    interval: 100,
  }),
  computed: {
    ...mapState(['useSandbox', 'selectedPixel', 'view']),
    ...mapState({
      isPlaying(state) {
        return state.sandbox.frontCanvas !== undefined && state.sandbox.frontCanvas !== -1;
      },
    }),
  },
  methods: {
    async theWholeProcess() {
      if (this.useSandbox) return;
      await this.startPlayback({
        from: 0,
        to: 1491238800000,
        interval: this.interval,
        duration: this.duration * 1000,
      });
      console.log(this.view);
      this.resetView();
    },
    async osu() {
      if (this.useSandbox) return;
      this.setView({
        baseScale: 9,
        center: {
          x: 0.5,
          y: 0.94,
        },
      });
      await this.startPlayback({
        from: 0,
        to: 1491238800000,
        interval: this.interval,
        duration: this.duration * 1000,
      });
      console.log(this.view);
      this.resetView();
    },
    async EUFlag() {
      if (this.useSandbox) return;
      this.setView({
        baseScale: 2.3,
        center: {
          x: 0.37,
          y: 0.76,
        },
      });
      await this.startPlayback({
        from: 0,
        to: 1491238800000,
        interval: this.interval,
        duration: this.duration * 1000,
      });
      console.log(this.view);
      this.resetView();
    },
    async theVoid() {
      if (this.useSandbox) return;
      this.setView({
        baseScale: 4,
        center: {
          x: 0.4,
          y: 0.58,
        },
      });
      await this.startPlayback({
        from: 0,
        to: 1491238800000,
        interval: this.interval,
        duration: this.duration * 1000,
      });
      console.log(this.view);
      this.resetView();
    },
    async blueCorner() {
      if (this.useSandbox) return;
      this.setView({
        baseScale: 1.6,
        center: {
          x: 0.7,
          y: 0.7,
        },
      });
      await this.startPlayback({
        from: 0,
        to: 1491238800000,
        interval: this.interval,
        duration: this.duration * 1000,
      });
      console.log(this.view);
      this.resetView();
    },
    async USFlag() {
      if (this.useSandbox) return;
      this.setView({
        baseScale: 5,
        center: {
          x: 0.5,
          y: 0.5,
        },
      });
      await this.startPlayback({
        from: 0,
        to: 1491238800000,
        interval: this.interval,
        duration: this.duration * 1000,
      });
      console.log(this.view);
      this.resetView();
    },
    playFast() {
      this.duration = 10;
      this.interval = 100;
    },
    playNormal() {
      this.duration = 30;
      this.interval = 100;
    },
    playSlow() {
      this.duration = 60;
      this.interval = 100;
    },
    ...mapActions(['startPlayback']),
    ...mapMutations(['resetView', 'setView']),
  },
};
</script>

<style>

.pixel-card {
  position: absolute;
  background-color: #333;
  color: #ccc;
}

.pixel-card .button {
  margin: .2rem;
}

.pixel-card .buttons {
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.pixel-card .instruction {
  font-size: larger;
}

.pixel-card .sub-instruction {
  font-size: small;
}

</style>