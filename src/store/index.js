import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);
const store = new Vuex.Store({
  state: {
    server: "http://localhost:8080",
    userinfo: {},
    start: ["0", "8:00", "8:50", "9:55", "10:45", "13:30", "15:20"],
    end: ["0", "8:45", "9:35", "10:40", "11:30", "15:15", "16:05"],
    status: {
      status_invalid: 0,
      status_valid: 1,
      status_cancelled: 2
    },
    status_detail: { 0: '未审核', 1: '已通过', 2: '已取消' }
  },
  mutations: {
    updateInfo(state, payload) {
      state.userinfo = payload;
    }
  },
  actions: {},
  getters: {
    // 服务器地址
    server(state) {
      return state.server;
    },

    start_time(state) {
      return function (start) {
        return state.start[start]
      }
    },

    end_time(state) {
      return function (end) {
        return state.end[end];
      }
    }
  }
});

export default store
