<script setup name="CheckData">
import { getCheckDataPicList } from '@/api/checkData'
// import KsRender from './KsRender1.vue'
import KsRender from './KsRender.vue'

const ksData = reactive({
  ksImgs: [
    '/src/assets/images/11-1.jpg',
    '//src/assets/images/11-2.jpg',
    '/src/assets/images/11-1.jpg',
    '/src/assets/images/11-1.jpg',
    '/src/assets/images/11-1.jpg',
    '/src/assets/images/11-2.jpg',
    '/src/assets/images/11-1.jpg',
    '/src/assets/images/11-2.jpg',
    '/src/assets/images/11-1.jpg',
    '/src/assets/images/11-2.jpg',
    '/src/assets/images/11-1.jpg',
    '/src/assets/images/11-2.jpg',
    '/src/assets/images/11-1.jpg',
    '/src/assets/images/11-2.jpg',
    '/src/assets/images/11-1.jpg',
    '/src/assets/images/11-2.jpg',
    '/src/assets/images/11-1.jpg',
    '/src/assets/images/11-2.jpg',
    '/src/assets/images/11-1.jpg',
    '/src/assets/images/11-2.jpg',
    '/src/assets/images/11-1.jpg',
    '/src/assets/images/11-2.jpg',
    '/src/assets/images/11-1.jpg',
    '/src/assets/images/11-2.jpg',
    '/src/assets/images/11-1.jpg',
    '/src/assets/images/11-2.jpg',
    '/src/assets/images/11-1.jpg',
    '/src/assets/images/11-2.jpg',
    '/src/assets/images/11-1.jpg',
    '/src/assets/images/11-2.jpg',
    '/src/assets/images/11-1.jpg',
    '/src/assets/images/11-2.jpg',
    '/src/assets/images/11-1.jpg',
    '/src/assets/images/11-2.jpg',
    '/src/assets/images/11-1.jpg',
    '/src/assets/images/11-2.jpg',
    '/src/assets/images/11-1.jpg',
    '/src/assets/images/11-2.jpg',
    '/src/assets/images/11-1.jpg',
    '/src/assets/images/11-2.jpg',
    '/src/assets/images/11-1.jpg',
    '/src/assets/images/11-2.jpg',
    '/src/assets/images/11-1.jpg',
    '/src/assets/images/11-3.jpg'
  ],
  ksFaults: [
    {
      width: 1228,
      height: 600,
      coordinateX: 0,
      coordinateY: 0,
      description: '测试故障1'
    },
    {
      width: 300,
      height: 300,
      coordinateX: 150,
      coordinateY: 150,
      description: '测试故障2'
    },
    {
      width: 500,
      height: 500,
      coordinateX: 150,
      coordinateY: 5800,
      description: '测试故障3'
    },
    {
      width: 1000,
      height: 1000,
      coordinateX: 0,
      coordinateY: 5800,
      description: '测试故障4'
    }
  ]
})
const loading = ref(false)
const showType = ref('VERTICAL')
const isVertical = computed(() => showType.value === 'VERTICAL')
const { ksImgs, ksFaults } = toRefs(ksData)

onMounted(() => {
  // getData()
})
const getData = () => {
  loading.value = true
  getCheckDataPicList({
    trainNo: '2404072103',
    fullCarNo: '107101',
    code: 11
  })
    .then((res) => {
      const data = res?.data || []
      const imgUrl = []
      let itemRects = []
      const obj = {}
      for (let i = 0, len = data.length; i < len; i++) {
        const item = data[i]
        imgUrl.push(item.imgPath)
        itemRects = itemRects.concat(item.faultFrames)
      }
      itemRects = itemRects.reduce((cur, next) => {
        obj[next.id] ? '' : (obj[next.id] = true && cur.push(next))
        return cur
      }, [])
      ksImgs.value = imgUrl
      ksFaults.value = itemRects
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<template>
  <div class="checkData" v-loading="loading" element-loading-background="transparent">
    <KsRender :ksData="ksData" :isVertical="isVertical" />
  </div>
</template>

<style lang="scss" scoped>
.checkData {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
