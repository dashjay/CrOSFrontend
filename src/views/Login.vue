<template>
  <div>
    <img src="../assets/ustb.jpg" class="logo" alt="" />
    <group title="登陆">
      <x-input
        title="用户名"
        :is-type="validUsername"
        placeholder="输入用户名"
        v-model="formdata.username"
      ></x-input>
      <x-input
        title="密码"
        :is-type="validPassword"
        placeholder="输入密码"
        type="password"
        v-model="formdata.password"
      ></x-input>
    </group>
    <x-button type="primary" class="login" @click.native="login">登陆</x-button>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import { XInput, Group } from "vux";

export default {
  name: "Login",
  data() {
    return {
      formdata: {
        username: "dj",
        password: "dj",
      },
      validUsername: function (value) {
        return {
          valid: value.length > 0,
          msg: "长度必须大于1",
        };
      },
      validPassword: function (value) {
        return {
          valid: value.length > 0,
          msg: "长度必须大于1",
        };
      },
    };
  },
  methods: {
    ...mapMutations(["updateInfo"]),
    login() {
      this.$http
        .post(this.server + "/api/user/login", this.formdata)
        .then((data) => {
          if (data.status === 0) {
            localStorage.setItem("jwt", data.data.jwt);
            localStorage.setItem("name", data.data.name);

            this.$vux.toast.show({
              text: "登录成功",
            });

            this.$router.push("/user_info");
          } else {
            this.$vux.toast.show({
              text: data.error,
              type: "warn",
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },

  computed: {
    ...mapGetters(["server", "jwt"]),
  },
  components: { XInput, Group },
};
</script>

<style scoped>
.logo {
  width: 70%;
  float: top;
  position: center;
  margin-left: 8vh;
  margin-top: 5vh;
}

.login {
  margin-top: 3vh;
}
</style>
