<template>
  <div>
    <panel header="学院列表" :footer="footer" :list="list" :type="type"
           @on-img-error="onImgError"></panel>
  </div>
</template>

<script>
    import {Panel} from 'vux'

    export default {
        name: "CollegeSelection",
        data() {
            return {
                type: '1',
                list: [
                    {
                        src: 'http://scce.ustb.edu.cn/img/bei.png',
                        fallbackSrc: 'http://scce.ustb.edu.cn/img/bei.png',
                        title: '机电信息楼',
                        desc: '总计：23教室，空闲：1个教室',
                        url: '/selection_room?college=jdxxl',
                        meta: {
                            source: '北京科技大学',
                            date: '2019-11-11',
                            other: '计通学院'
                        }
                    },
                    {
                        src: 'http://scce.ustb.edu.cn/img/bei.png',
                        fallbackSrc: 'http://scce.ustb.edu.cn/img/bei.png',
                        title: '文法学院',
                        desc: '总计：666教室，空闲：1个教室',
                        // url: '/component/cell',
                        meta: {
                            source: '北京科技大学',
                            date: '2019-11-11',
                            other: '文法学院'
                        }
                    }
                ],
                footer: {
                    title: "更多",
                    url: 'http://vux.li'
                }
            }
        },
        components: {
            Panel
        },
        methods: {
            loadData() {

            },
            onImgError(item, $event) {
                console.log(item, $event)
            },

        }

    }
</script>

<style scoped>

</style>
