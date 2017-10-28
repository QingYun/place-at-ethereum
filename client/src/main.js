// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import pino from 'pino';
import Buefy from 'buefy';
import 'buefy/lib/buefy.css';
import App from './App';
import router from './router';
import store from './store';

global.logger = pino({
  browser: { asObject: true },
  level: process.env.LOG_LEVEL || 'trace',
  prettyPrint: process.env.NODE_ENV !== 'production',
});

Vue.config.productionTip = false;

Vue.use(Buefy);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App },
});

const wsc = new WebSocket(`ws://${window.location.hostname}:8081`, 'place-watcher-protocol');
wsc.onopen = () => logger.info('WebSocket opened');
wsc.onmessage = (evt) => {
  const msg = JSON.parse(evt.data);
  switch (msg.action) {
    case 'INIT_CANVAS':
      store.commit('initCanvas', msg.payload);
      store.dispatch('startRefreshingDifficulty');
      break;
    case 'UPDATE_PIXEL':
      store.commit('updatePixel', msg.payload);
      store.dispatch('startRefreshingDifficulty');
      break;
    case 'RESIZE_CANVAS':
      logger.error('Unimplemented Canvas Resize Event');
      break;
    default:
      logger.error('Unknown event [%s]', evt.action);
  }
};
