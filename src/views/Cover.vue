<template>
  <div>
    <img src="../assets/ustb.jpg" alt="" class="logo">

    <flexbox class="flex-container cover-button">
      <flexbox-item>
        <div class="flex-demo left">
          <x-button type="primary">查看空教室</x-button>
        </div>
      </flexbox-item>
      <flexbox-item>
        <div class="flex-demo right">
          <x-button type="primary" @click.native="login">登录</x-button>
        </div>
      </flexbox-item>
    </flexbox>
  </div>
</template>

<script>
    import {Flexbox, FlexboxItem} from 'vux'

    export default {
        name: "COVER",
        methods: {
            login() {
                this.$router.push("/login")
            }
        },
        components: {
            Flexbox,
            FlexboxItem,
        }
    }
</script>

<style scoped>
  .flex-container {
    margin-top: 40px;
    margin-left: 40px;
  }

  .flex-demo {
    text-align: center;
    width: 120px;
    height: 30px;
    color: #fff;
    /*background-color: #b98c8a;*/
    border-radius: 9px;
    background-clip: padding-box;
  }

  .left {
    margin-left: 10px;
  }

  .right {
    margin-right: 10px;
  }

  .logo {
    width: 70%;
    float: top;
    position: center;
    margin-left: 8vh;
    margin-top: 5vh;
  }
  .cover-button{
    margin-top:200px;
  }
</style>
