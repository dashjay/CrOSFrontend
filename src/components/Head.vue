<template>
  <div>
    <x-header
      :left-options="{ showBack: show, backText: backText, preventGoBack: pgb }"
      @on-click-back="back"
      >{{ title }}
    </x-header>
  </div>
</template>

<script>
import { XHeader } from "vux";
import { mapGetters } from "vuex";

export default {
  name: "Head.vue",
  data() {
    return {
      show: false,
      title: "教室预定系统",
      backText: "返回",
      ToastContent: "",
      ShowToast: false,
      pgb: false,
      collegeList: {
        1: "机电信息楼",
      },
    };
  },
  created(){
    let jwt = localStorage.getItem("jwt");
    if(jwt){
      console.log(jwt);
      this.showBack=true;
      this.title="用户信息",
      this.backText="注销",
      this.pgb = true;
    }
  },
  methods: {
    setheader(route) {
      this.show = route.meta.showBack;
      this.title = route.meta.title;
      this.backText = route.meta.backText;
      this.pgb = route.meta.pgb;

      if (this.$route.path === "/selection_room") {
        this.title =
          this.collegeList[this.$route.query.college_id] + " | " + this.title;
      }
    },
    logout() {
      //注销逻辑
      localStorage.removeItem("jwt");
      this.ToastContent = "注销成功";
      this.showToast = true;
      this.$router.push("/");
    },
    back() {
      console.log(this.$route.path);
      switch (this.$route.path) {
        case "/select_college": {
          this.logout();
          break;
        }
        case "/user_info": {
          this.logout();
          break;
        }
      }
    },
  },
  computed: {
    ...mapGetters(["server"]),
  },
  watch: {
    $route() {
      this.setheader(this.$route);
      switch (this.$route.path) {
        case "/": {
          break;
        }
        case "/login": {
          break;
        }
        case "/select_college": {
          break;
        }
      }
    },
  },

  components: {
    XHeader,
  },
};
</script>

<style scoped>
</style>
