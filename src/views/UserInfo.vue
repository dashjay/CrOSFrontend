<template>
  <div>
    <!-- HEAD: 用户信息card -->
    <card :header="{ title: '用户信息' }">
      <p slot="content" class="card-padding">
        <cell title="用户名:" :value="Name"></cell>
      </p>
    </card>

    <!-- HEAD: 功能按钮区 -->
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

    <!-- HEAD: 已定教室列表 -->
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
          <span :style="'color: ' + status_color[item.status]">{{
            status_detail[item.status]
          }}</span>
        </div>

        <div class="vux-1px-r" style="padding-top: 10px">
          <x-button
            type="primary"
            style="width: 70px; height: 30px; color: white; font-size: 13px"
            :data-record_id="item.id"
            @click.native="clickButton(item)"
            >操作
          </x-button>
        </div>
      </div>
    </card>

    <actionsheet
      v-model="show_op_menu"
      :menus="menu"
      theme="android"
      @on-click-menu="clickmenu"
    ></actionsheet>

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

    <popup v-model="showqr" position="left" width="100%">
      <div class="qr">
        <span class="qrcode">
          <qrcode :value="qrsource" type="img"></qrcode>
        </span>
        <x-button
          type="primary"
          style="color: white; width: 70%"
          @click.native="showqr = false"
          >点击返回</x-button
        >
      </div>
    </popup>
  </div>
</template>

<script>
import {
  Cell,
  Card,
  FormPreview,
  Flexbox,
  FlexboxItem,
  Popup,
  Actionsheet,
  Qrcode,
} from "vux";

import { mapGetters, mapState } from "vuex";

export default {
  name: "UserInfo.vue",
  components: {
    Cell,
    Card,
    FormPreview,
    Flexbox,
    FlexboxItem,
    Popup,
    Actionsheet,
    Qrcode,
  },
  data() {
    return {
      // 操作菜单
      show_op_menu: false,
      menu: {
        cancel: "取消",
        showqr: "显示二维码",
        remind: "提醒审核",
      },
      current_clicked_booking: null,
      qrsource: "null",

      showqr: false,
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

  computed: {
    ...mapState(["status", "status_detail", "status_color"]),
    ...mapGetters(["server", "start_time", "end_time"]),

    Name() {
      return localStorage.getItem("name");
    },
    ButtonText() {
      return function (status) {
        if (status == this.status.status_valid) {
          return "取消";
        } else {
          return "fuck";
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
    clickmenu(e) {
      switch (e) {
        case "cancel": {
          console.log("取消 ", this.current_clicked_booking);
          if (
            this.current_clicked_booking.status == this.status.status_cancelled
          ) {
            this.$vux.toast.show({
              text: "已取消",
              type: "warn",
            });
          } else {
            this.classroomId = this.current_clicked_booking.id;
            this.showRefund = true;
          }
        }
        case "showqr": {
          console.log("显示二维码 ", this.current_clicked_booking);
          this.qrsource = this.current_clicked_booking.id;

          switch (this.current_clicked_booking.status) {
            case this.status.status_valid: {
              this.showqr = true;
              break;
            }
            case this.status.status_invalid: {
              this.$vux.toast.show({
                text: "暂未通过审核",
                type: "warn",
              });
              break;
            }
            case this.status.status_cancelled: {
              this.$vux.toast.show({
                text: "预订已经取消",
                type: "warn",
              });
              break;
            }
          }
        }
      }
    },
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
    clickButton(e) {
      this.current_clicked_booking = e;
      this.show_op_menu = true;
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
        })
        .finally(() => {
          this.refreshList();
        });
    },
    onShow() {},
    onHide() {},
  },
};
</script>

<style scoped>
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
.qr {
  display: flex;
  flex-direction: column;
}

.qrcode {
  margin: 0 auto;
  padding-top: 50%;
}
</style>
