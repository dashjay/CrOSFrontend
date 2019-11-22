import Vue from 'vue'
import FastClick from 'fastclick'

import App from './App'
import store from './store'
import router from "./router"

import http from './components/http.js'
Vue.prototype.$http = http;

import { deepClone, nowTime2Str, str2TimeDict } from './components/utils.js'
// Vue.prototype.$deepClone = deepClone;
Vue.prototype.$utils = {
  deepClone: deepClone,
  nowTime2Str: nowTime2Str,
  str2TimeDict: str2TimeDict
}


import { XButton, ToastPlugin, LoadingPlugin } from 'vux'
Vue.use(LoadingPlugin);
Vue.use(ToastPlugin, { position: 'bottom' });

Vue.component('x-button', XButton);

import { Confirm } from 'vux'
Vue.component('confirm', Confirm)
import { ConfirmPlugin } from 'vux'
Vue.use(ConfirmPlugin)


import { Toast } from 'vux'
Vue.component('toast', Toast)

FastClick.attach(document.body);

Vue.config.productionTip = false;



/* eslint-disable no-new */
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app-box');
