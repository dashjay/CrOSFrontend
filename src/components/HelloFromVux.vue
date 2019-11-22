<template>
  <div>
    <div class="vux-demo">
      <img class="logo" src="../assets/ustb.jpg" alt="" >
      <h1></h1>
    </div>
    <group title="cell demo">
      <cell title="功能列表" value="点我去借教室" is-link :link="classroom"></cell>
    </group>
  </div>
</template>

<script>
    import {Group, Cell} from 'vux'

    export default {
        components: {
            Group,
            Cell
        },
        data() {
            return {
                msg: 'Hello World!',
                classroom:"/classroom"
            }
        }
    }
</script>

<style>
  .vux-demo {
    text-align: center;
  }

  .logo {
    width: 140px;
    height: 106px
  }
</style>
