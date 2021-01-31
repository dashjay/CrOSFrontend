<template>
  <div>
    <card :header="{ title: '用户信息' }">
      <p slot="content" class="card-padding">
        <cell title="用户名:" :value="Name"></cell>
      </p>
    </card>

    <flexbox
      class="flex-container cover-button"
      style="padding-top: 10px; padding-bottom: 20px"
    >
      <flexbox-item>
        <div class="flex-demo left">
          <x-button type="disabled" style="color: grey">查看空教室</x-button>
        </div>
      </flexbox-item>
      <flexbox-item>
        <div class="flex-demo right">
          <x-button type="primary" @click.native="reserve">预定教室</x-button>
        </div>
      </flexbox-item>
    </flexbox>

    <card :header="{ title: '已定教室' }">
      <div slot="content" class="card-flex card-demo-content01">
        <div class="vux-1px-r">
          {{ "房间名" }}
          <br />
        </div>
        <div class="vux-1px-r">
          {{ "日期时间" }}
          <br />
        </div>

        <div class="vux-1px-r">
          {{ "状态" }}
          <br />
        </div>

        <div class="vux-1px-r">
          {{ "操作" }}
        </div>
      </div>

      <div
        v-for="item in lendinfo"
        :key="item.id"
        slot="content"
        class="card-flex card-demo-content01"
      >
        <div class="vux-1px-r">
          <br />
          <span>{{ item.name }}</span>
        </div>
        <div class="vux-1px-r">
          <br />
          <span>{{ item.date }} <br />{{ item.time }}</span>
        </div>

        <div class="vux-1px-r">
          <br />
          <span>{{ status_detail[item.status] }}</span>
        </div>

        <div class="vux-1px-r" style="padding-top: 10px">
          <x-button
            :type="ButtonColor(item.status)"
            style="width: 70px; height: 30px; color: black; font-size: 10px"
            :data-record_id="item.id"
            @click.native="refund(item.id, item.status)"
            >{{ ButtonText(item.status) }}
          </x-button>
        </div>
      </div>
    </card>

    <div>
      <confirm
        v-model="showRefund"
        title="确定退订么?"
        :show-input="true"
        :hide-on-blur="true"
        placeholder="退订原因"
        @on-cancel="onCancel"
        @on-confirm="onConfirm"
        @on-show="onShow"
        @on-hide="onHide"
      >
        <p style="text-align: center">{{ "请输入退订原因，并点击确定" }}</p>
      </confirm>
    </div>
  </div>
</template>

<script>
import { Cell, Card, FormPreview, Flexbox, FlexboxItem } from "vux";
import { mapGetters, mapState } from "vuex";

export default {
  name: "UserInfo.vue",
  data() {
    return {
      classroomId: "",
      showRefund: false,
      Lending: true,
      lengdingList: [],
      lendinfo: [],
    };
  },
  created() {
    this.refreshList();
  },
  components: {
    Cell,
    Card,
    FormPreview,
    Flexbox,
    FlexboxItem,
  },
  computed: {
    ...mapState(["status", "status_detail"]),
    ...mapGetters(["server", "start_time", "end_time"]),

    Name() {
      return localStorage.getItem("name");
    },
    ButtonText() {
      return function (status) {
        if (status == this.status.status_valid) {
          return "取消";
        } else {
          return "无法操作";
        }
      };
    },
    ButtonColor() {
      return function (status) {
        if (status == this.status.status_valid) {
          return "warn";
        } else {
          return "disabled";
        }
      };
    },
  },
  methods: {
    refreshList() {
      this.$http
        .get(this.server + "/api/cr/my_booking", {
          headers: { Authorization: "bearer " + localStorage.getItem("jwt") },
        })
        .then((data) => {
          if (data.status == 0) {
            let lengdingList = data.data;
            if (lengdingList.length < 1) {
              return;
            }

            let lendinfo = [];

            lengdingList.forEach((x) => {
              lendinfo.push({
                status: x.status,
                id: x._id,
                name: x.room_name,
                date: x.year + "-" + x.month + "-" + x.day,
                time: this.start_time(x.start) + "-" + this.end_time(x.end),
              });
            });

            this.lendinfo = lendinfo;
          } else {
            this.$vux.toast.show({
              type: "close",
              text: "加载失败",
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },

    refund(e, status) {
      if (status != this.status.status_valid) {
        this.$vux.toast.show({
          position: "middle",
          type: "warn",
          text: "无法操作",
        });
        return;
      }
      // prompt形式调用
      this.showRefund = true;
      this.classroomId = e;
    },
    reserve() {
      this.$router.push("/selection_room");
    },
    onCancel() {
      console.log("cancel refund the classroom " + this.classroomId);
    },
    onConfirm(e) {
      console.log(
        "confirm refund the classroom " + this.classroomId + ", 退订原因：" + e
      );

      this.$http
        .get(this.server + "/api/cr/release_booking/" + this.classroomId, {
          headers: { Authorization: "bearer " + localStorage.getItem("jwt") },
        })
        .then((data) => {
          if (data.status == 0) {
            this.$vux.toast.show({
              type: "success",
              text: "取消成功",
            });
          } else {
            this.$vux.toast.show({
              type: "cancel",
              width: "17.6em",
              position: "middle",
              text: data.error,
            });
          }
        })
        .catch((e) => {
          console.log(e);
        });
    },
    onShow() {},
    onHide() {},
  },
};
</script>

<style scoped>
/* @import "~vux/src/styles/1px.less"; */

.card-flex {
  display: flex;
}
.card-demo-content01 {
  padding: 10px 0;
}
.card-padding {
  padding: 15px;
}
.card-flex > div {
  flex: 1;
  text-align: center;
  font-size: 12px;
}
.card-flex span {
  color: #2417e2;
}
.left {
  margin-left: 10px;
}

.right {
  margin-right: 10px;
}

.flex-container {
  margin-top: 20px;
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
.vux-form-preview {
  margin-top: 30px;
}
</style>
