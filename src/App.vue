<template>
  <div id="app">
    <Head></Head>
    <router-view></router-view>
  </div>
</template>

<script>
import Head from "./components/Head";

export default {
  name: "app",
  data() {
    return {
      locale: "en",
    };
  },
  created() {
    
  },
  watch: {},
  components: {
    Head,
  },
};
</script>
<style lang="less">
@import "~vux/src/styles/reset.less";

body {
  background-color: #ffffff;
}

html,
body {
  overflow: hidden;
  overflow-y: auto;
}
</style>
