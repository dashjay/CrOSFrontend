<template>
  <div>
    <!-- HEAD: 日期选择器 -->
    <group :title="GetTitle">
      <datetime
        v-model="formdata.date"
        @on-change="onChangeData"
        title="日期"
        @on-cancel="log('cancel')"
        @on-confirm="onConfirmData"
      ></datetime>
    </group>
    <!-- HEAD: 时间选择器 -->

    <picker
      :data="ranges"
      v-model="ranges_value"
      @on-change="changeDatetime"
    ></picker>

    <!-- HEAD: 教室情况 -->
    <group title="教室情况"></group>
    <p style="text-align: center" v-if="loading">
      <inline-loading></inline-loading>
      <span
        style="vertical-align: middle; display: inline-block; font-size: 14px"
        >&nbsp;&nbsp; 加载中
      </span>
    </p>
    <grid :show-lr-borders="false" :cols="4" v-else>
      <grid-item
        v-for="i in roomInfo"
        :key="i.room_id"
        :style="'background: ' + (i.is_free === true ? 'greenyellow' : 'red')"
      >
        <span class="grid-center" @click="roomClick(i)">{{ i.room_name }}</span>
      </grid-item>
    </grid>

    <actionsheet
      v-model="dialogue"
      :menus="menu"
      theme="android"
      @on-click-menu="clickmenu"
    ></actionsheet>

    <!-- HEAD: 侧边弹出栏 -->
    <div>
      <popup v-model="showDetail" position="right">
        <div style="width: 300px">
          <div>
            <panel
              header="教室使用情况"
              :list="list"
              type="4"
              @on-click-item="choose"
            ></panel>
          </div>
        </div>
      </popup>
    </div>

    <!--    弹出确认框-->
    <!-- <div>
      <confirm
        v-model="showConfirm"
        show-input
        ref="confirm"
        title="您确定要借用这间教室么？"
        :content="ConfirmContent"
        showContet
        @on-cancel="onCancel"
        @on-confirm="onConfirm"
        @on-show="onShow"
        @on-hide="onHide"
      ></confirm>
    </div> -->
  </div>
</template>



<script>
/*
 *这个页面的业务流程比较简单：
 1. 页面开启时，初始化所有教室列表【按照当天日期，和第一节课来初始化】
 2. 初始化后改变日期或者时间就要重新更新教室的可用信息
 3. 点击可用教室之后，尝试申请 
 */

import {
  Datetime,
  Group,
  Grid,
  GridItem,
  Popup,
  TransferDom,
  Picker,
  Panel,
  Actionsheet,
  Confirm,
  throttle,
  InlineLoading,
} from "vux";

import { mapGetters } from "vuex";

let originRangeData = [
  [
    "1a 8:00",
    "1b 8:50",
    "2a 9:55",
    "2b 10:55",
    "3a 13:30",
    "3b 14:20",
    "4a 15:20",
    "4b 16:10",
    "5a 17:10",
    "5b 18:00",
    "6a 19:30",
    "6b 20:20",
  ],
  [
    "1a 8:45",
    "1b 9:35",
    "2a 10:40",
    "2b 11:30",
    "3a 14:15",
    "3b 15:05",
    "4a 16:05",
    "4b 16:55",
    "5a 17:55",
    "5b 18:45",
    "6a 20:15",
    "6b 21:05",
  ],
];

let _originIdx = [
  {
    "1a 8:00": 1,
    "1b 8:50": 2,
    "2a 9:55": 3,
    "2b 10:55": 4,
    "3a 13:30": 5,
    "3b 14:20": 6,
    "4a 15:20": 7,
    "4b 16:10": 8,
    "5a 17:10": 9,
    "5b 18:00": 10,
    "6a 19:30": 11,
    "6b 20:20": 12,
  },
  {
    "1a 8:45": 1,
    "1b 9:35": 2,
    "2a 10:40": 3,
    "2b 11:30": 4,
    "3a 14:15": 5,
    "3b 15:05": 6,
    "4a 16:05": 7,
    "4b 16:55": 8,
    "5a 17:55": 9,
    "5b 18:45": 10,
    "6a 20:15": 11,
    "6b 21:05": 12,
  },
];

let DateTime2Idx = function (selected_time) {
  return [_originIdx[0][selected_time[0]], _originIdx[1][selected_time[1]]];
};

export default {
  name: "RoomSelection.vue",
  //===================================================data==========================start
  data() {
    return {
      // -----------util------------
      //加载
      loading: false,
      /**
       *提示是否显示
       * */

      // 是否显示菜单，点击某个教室显示
      dialogue: false,
      // TIP:菜单，为了可添加
      menu: {
        detail: "查看使用情况并借用",
        feedback: "数据不对，联系我们~",
      },

      // -----------util end-------

      // -------时间相关-------

      // 当前点选的时间
      CurrentTime: -1,
      // 选择的时间[1,2,3,4,5]
      timeSelected: null,
      ranges: [],
      ranges_value: [],
      // 每天的六大节课

      // -------时间相关end---------

      // -------教室相关start-------
      // 当前选择的教室
      CurrentClickRoom: {},

      // 从服务器拉取的，原始的教室列表
      originRoomList: [],

      // 查询到的所有教室情况
      roomInfo: [],
      // 显示某个教室天的情况的Bool
      showDetail: false,
      list: [],
      // TIP: 查询空教室的表单
      formdata: {
        date: "2019-11-25", // 查询日期
        time_section: [], // 时间[1,2,3,4]代表查询第一二三四节课
      },
      // TIP:是否显示Confirm菜单
      showConfirm: false,
      // -------教室相关end-------
    };
  },

  //===================================================data==========================end
  methods: {
    /**
     * 获取原始教室列表信息
     */
    getOriginRoomList() {
      this.$http.get(this.server + "/api/cr/list").then((data) => {
        if (data.status == 0) {
          this.originRoomList = data.data;
          this.refreshList(null);
        } else {
          this.$vux.toast.show({
            type: "warn",
            text: data.error,
          });
        }
      });
    },

    // 通过选择的时间来刷新教室列表可用信息
    refreshList(useageInfo) {
      let filter = useageInfo != undefined && useageInfo != null;
      let roomInfo = [];
      let ranges = DateTime2Idx(this.ranges_value);

      this.originRoomList.forEach((x) => {
        let is_free = true;
        if (filter) {
          console.log("drop into filter ", useageInfo);
          console.log("ranges ", ranges);

          for (var i = 0; i < useageInfo.length; i++) {
            if (x.id == useageInfo[i].classroom_id) {
              if (
                ranges[0] >= useageInfo[i].start &&
                ranges[0] <= useageInfo[i].end
              ) {
                is_free = false;
              }
              if (
                ranges[1] >= useageInfo[i].start &&
                ranges[1] <= useageInfo[i].end
              ) {
                is_free = false;
              }
            }
          }
        }
        roomInfo.push({
          id: x.id,
          room_name: x.room_name,
          extra: x.extra,
          is_free: is_free,
        });
      });
      this.roomInfo = roomInfo;
    },
    //----------------日期选择器相关------------------
    /**
     * 点击更换日期的函数
     * */
    onChangeData() {
      console.log("更换日期");
    },
    /**
     * 更换完成确认操作
     * */
    onConfirmData() {
      this.SearchRoomState();
    },
    //-----------------------------------------------

    //----------------教室选择器相关--------------------
    /**
     * 当点击下方教室的时候
     * */
    roomClick(room) {
      console.log(room);
      // 确定当前被选择教室
      this.CurrentClickRoom = room;
      // 打开对话框
      this.dialogue = true;
    },
    // 将后端传回的教室信息填充进空的一天。
    parseResult(result) {
      let l = this.$utils.deepClone(originlist);
      if (result.length === 0) {
        this.list = l;
      } else {
        result.forEach((x) => {
          l[x.time_section - 1].desc = x.comment === "" ? "未知" : x.comment;
        });
        this.list = l;
      }
    },

    /**
     * 点击菜单，方便未来增加选项
     * @param {Object} key 菜单名称
     */
    clickmenu(key) {
      console.log(key);
      switch (key) {
        case "detail": {
          // 拉取详细数据
          this.updateDetail();
          break;
        }
        case "feedback": {
          /**
           * 定义反馈业务
           */
          break;
        }
      }
    },
    changeDatetime(e) {
      let temp_ranges = this.$utils.deepClone(originRangeData);
      var ptr = 0;
      while (temp_ranges[0][ptr] != e[0]) {
        ptr += 1;
        temp_ranges[1].shift();
      }
      this.ranges = temp_ranges;
      this.SearchRoomState();
    },

    /**
     * 更新选定教室一天的安排，并且弹出菜单显示
     */
    updateDetail() {
      let ranges = DateTime2Idx(this.ranges_value);
      let dt = this.$utils.str2TimeDict(this.formdata.date);
      let booking_request = {
        classroom_id: this.CurrentClickRoom.id,
        start: ranges[0],
        end: ranges[1],
        year: dt["year"],
        month: dt["month"],
        day: dt["day"],
      };

      this.$http
        .post(this.server + "/api/cr/booking", booking_request)
        .then((res) => {
          console.log(res);
          if (res.status == 0) {
            this.$vux.toast.show({
              text: "预订成功",
            });
            this.$router.push("/user_info");
          }else{
            this.$vux.toast.show({
              text: "预订失败",
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    /**
     * 搜索房间状态，自触发函数。当选择了时间，房间，选项后都会触发该函数
     */
    SearchRoomState: function () {
      // this.loading = true;

      let payload = this.$utils.str2TimeDict(this.formdata.date);

      console.log(payload);

      this.$http
        .post("/api/cr/list_all_used", payload)
        .then((data) => {
          this.refreshList(data.data);
        })
        .catch((err) => {
          console.log(err);
        });

      this.loading = false;
    },

    /**
     * @param {Object} e 选定按钮
     * 选定最后要接的时段
     */
    choose(e) {
      this.CurrentTime = e.time_section;
      this.showConfirm = true;
    },

    //-----------------------------------------------

    //----------------弹窗确认相关--------------------
    onCancel() {
      console.log("onCancel");
    },
    /**
     * 确认借用教室~
     */
    onConfirm(e) {
      let form = {
        room_id: this.CurrentClickRoom.room_id,
        date: this.formdata.date,
        time_section: this.CurrentTime,
        comment: e,
      };

      this.$http
        .post(this.server_getter + "order/addorder", form)
        .then((data) => {
          this.$vux.toast.show({
            text: data.msg,
          });
          this.showDetail = false;
          this.SearchRoomState();
        })
        .catch((err) => {
          console.log(err);
        });
      console.log(form);
    },
  },

  //===================================================created==========================start
  created() {
    // 给搜索的操作注册为1000毫秒的间隔
    this.SearchRoomState = throttle(this.SearchRoomState, 1000);

    this.formdata.date = this.$utils.nowTime2Str();

    this.ranges = this.$utils.deepClone(originRangeData);

    this.getOriginRoomList();
  },
  //===================================================created==========================end
  ///////////////////////////////////////////////////////////////////////////////////////////
  //===================================================computed==========================start
  computed: {
    //getCollegeID 获取学院ID的
    ...mapGetters(["server"]),

    // ConfirmContent() {
    //   console.log(this.CurrentClickRoom.room_name);
    //   return (
    //     this.formdata.date +
    //     "<br>" +
    //     this.CurrentClickRoom.room_name +
    //     " " +
    //     "第" +
    //     this.CurrentTime +
    //     "节<br>请填写借用原因"
    //   );
    // },
    GetTitle() {
      return "选择日期 |今天是 " + this.$utils.nowTime2Str();
    },
  },
  //===================================================computed==========================end
  components: {
    Actionsheet,
    Datetime,
    Group,
    Grid,
    GridItem,
    Popup,
    TransferDom,
    Panel,
    Confirm,
    InlineLoading,
    Picker,
  },
};
</script>

<style scoped>
.box {
  padding-left: 50px;
  margin: auto;
}

.grid-center {
  display: block;
  text-align: center;
  color: #000000;
}
</style>
