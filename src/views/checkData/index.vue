<script setup name="CheckData">
import { getCheckDataPicList } from '@/api/checkData'
import KsRender from './KsRender.vue'

const ksData = reactive({
  ksImgs: [],
  ksFaults: []
})
const loading = ref(false)
const showType = ref('VERTICAL')
const isVertical = computed(() => showType.value === 'VERTICAL')
const { ksImgs, ksFaults } = toRefs(ksData)

onMounted(() => {
  getData()
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
    <KsRender :ksImgs="ksImgs" :ksFaults="ksFaults" :isVertical="isVertical" />
  </div>
</template>

<style lang="scss" scoped>
.checkData {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
