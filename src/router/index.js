
import VueRouter from 'vue-router'
import Vue from "vue";
import {CollegeSelection, Cover, Login, RoomSelection, UserInfo} from "../views";
Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    component: Cover,
    meta: {
      showBack: false,
      title: "教室预定系统",
    }
  },
  {
    path: "/login",
    component: Login,
    meta: {
      showBack: true,
      title: "登陆",
      backText: '返回'
    }
  },
  {
    path: "/select_college",
    component: CollegeSelection,
    meta: {
      showBack: true,
      title: "选择学院",
      backText: '注销',
      pgb: true,
    }
  },
  {
    path: "/selection_room",
    component: RoomSelection,
    meta: {
      showBack: true,
      title: "选择教室",
      backText: '返回',
    }
  },
  {
    path: "/user_info",
    component: UserInfo,
    meta: {
      showBack: true,
      title: "用户信息",
      backText: "注销",
      pgb:true
    }
  }

];

const router = new VueRouter({
  routes
});

export default router
