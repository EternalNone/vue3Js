<script setup name="CheckData">
import { ElMessage } from 'element-plus'
import { getCheckDataPicList, getPassageway, faultReviewExport } from '@/api/checkData'
import { useGlobalStore } from '@/store/modules/global'
import { download } from '@/utils/file.js'
import PassTrainFilter from '@/components/PassTrainFilter.vue'
// import KsRender from './KsRender1.vue'
import KsRender from './KsRender.vue'

const globalStore = useGlobalStore()
const { moduleType } = storeToRefs(globalStore)

const ksData = reactive({
  ksImgs: [
    // '/src/assets/images/11-1.jpg',
    // '//src/assets/images/11-2.jpg',
    // '/src/assets/images/11-1.jpg',
    // '/src/assets/images/11-1.jpg',
    // '/src/assets/images/11-1.jpg',
    // '/src/assets/images/11-2.jpg',
    // '/src/assets/images/11-1.jpg',
    // '/src/assets/images/11-2.jpg',
    // '/src/assets/images/11-1.jpg',
    // '/src/assets/images/11-2.jpg',
    // '/src/assets/images/11-1.jpg',
    // '/src/assets/images/11-2.jpg',
    // '/src/assets/images/11-1.jpg',
    // '/src/assets/images/11-2.jpg',
    // '/src/assets/images/11-1.jpg',
    // '/src/assets/images/11-2.jpg',
    // '/src/assets/images/11-1.jpg',
    // '/src/assets/images/11-2.jpg',
    // '/src/assets/images/11-1.jpg',
    // '/src/assets/images/11-2.jpg',
    // '/src/assets/images/11-1.jpg',
    // '/src/assets/images/11-2.jpg',
    // '/src/assets/images/11-1.jpg',
    // '/src/assets/images/11-2.jpg',
    // '/src/assets/images/11-1.jpg',
    // '/src/assets/images/11-2.jpg',
    // '/src/assets/images/11-1.jpg',
    // '/src/assets/images/11-2.jpg',
    // '/src/assets/images/11-1.jpg',
    // '/src/assets/images/11-2.jpg',
    // '/src/assets/images/11-1.jpg',
    // '/src/assets/images/11-2.jpg',
    // '/src/assets/images/11-1.jpg',
    // '/src/assets/images/11-2.jpg',
    // '/src/assets/images/11-1.jpg',
    // '/src/assets/images/11-2.jpg',
    // '/src/assets/images/11-1.jpg',
    // '/src/assets/images/11-2.jpg',
    // '/src/assets/images/11-1.jpg',
    // '/src/assets/images/11-2.jpg',
    // '/src/assets/images/11-1.jpg',
    // '/src/assets/images/11-2.jpg',
    // '/src/assets/images/11-1.jpg',
    // '/src/assets/images/11-3.jpg'
  ],
  ksFaults: [
    // {
    //   width: 1228,
    //   height: 600,
    //   coordinateX: 0,
    //   coordinateY: 0,
    //   faultDesc: '测试故障1'
    // },
    // {
    //   width: 300,
    //   height: 300,
    //   coordinateX: 150,
    //   coordinateY: 150,
    //   faultDesc: '测试故障2'
    // },
    // {
    //   width: 500,
    //   height: 500,
    //   coordinateX: 150,
    //   coordinateY: 5800,
    //   faultDesc: '测试故障3'
    // },
    // {
    //   width: 1000,
    //   height: 1000,
    //   coordinateX: 0,
    //   coordinateY: 5800,
    //   faultDesc: '测试故障4'
    // }
  ]
})
const searchForm = {
  isFault: false, // 精扫列表是否只看异常图
  fullCarNo: '', // 完整车号
  code: '' // 通道号
}
const trainInfo = ref({})
const warningInfo = ref({})
const passagewayList = ref([])
const loading = ref(false)
const showType = ref('VERTICAL')
const { ksImgs, ksFaults } = toRefs(ksData)
const isVertical = computed(() => showType.value === 'VERTICAL')

onMounted(() => {
  getPassWayList()
})
// 获取编组类型
const getType = (columnPosition, carNo) => {
  if (!columnPosition) {
    return '--'
  } else {
    switch (columnPosition) {
      case '3':
        return '重连'
      case '0':
        if (carNo.includes('+')) {
          return '重连'
        } else {
          return '长编'
        }
      default:
        return '短编'
    }
  }
}
// 获取当前选中的过车信息
const getPassTrainData = (train) => {
  trainInfo.value = train
  if (train.trainNo) {
    getData()
  } else {
    ksImgs.value = []
    ksFaults.value = []
  }
}
// 获取通道接口
const getPassWayList = () => {
  getPassageway({ moduleType: moduleType.value }).then((res) => {
    const data = res?.data || []
    passagewayList.value = data
    searchForm.code = data?.length ? data[0].code : ''
    showType.value = data?.length ? data[0].showType : ''
  })
}
// 选择通道，切换页面布局
const changePassageway = (val) => {
  const curOps = passagewayList.value?.find((item) => item.code === val)
  showType.value = curOps?.showType || ''
  getData()
}
// 获取检测数据
const getData = () => {
  const { trainNo } = trainInfo.value
  loading.value = true
  getCheckDataPicList({
    trainNo,
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
// 导出故障复核单
const exportFault = () => {
  if (!trainInfo.value?.trainNo) {
    return
  }
  faultReviewExport(trainInfo.value.trainNo).then((res) => {
    const filename = window.decodeURI(res.headers['content-disposition'].split("''")[1])
    download(res.data, filename, 'application/msword')
    ElMessage({
      message: '导出成功',
      type: 'success'
    })
  })
}
</script>

<template>
  <div class="checkData">
    <PassTrainFilter @getPassTrainData="getPassTrainData" />
    <div class="check-data-main">
      <div class="check-data-top">
        <div class="train-info">
          <div>
            <span>检测状态：</span>
            <span
              :style="{
                color: moduleType === 'OUTSIDE' || trainInfo.checkEndDate ? '#43fd33' : '#e73840'
              }"
            >
              {{ moduleType === 'OUTSIDE' || trainInfo.checkEndDate ? '已完成' : '未完成' }}
            </span>
          </div>
          <div>
            <span>车型：</span>
            <span>{{ trainInfo?.vehicleModel || '--' }}</span>
          </div>
          <div>
            <span>车号：</span>
            <span>{{ trainInfo?.carNo || '--' }}</span>
          </div>
          <div v-show="moduleType === 'INSIDE'">
            <span>端位：</span>
            <span>{{ `0${trainInfo.endPosition ?? 0}` }}</span>
          </div>
          <div>
            <span>编组类型：</span>
            <span>
              {{ getType(trainInfo.columnPosition, trainInfo.carNo) }}
            </span>
          </div>
          <div v-show="moduleType === 'INSIDE'">
            <span>股道：</span>
            <span>{{ trainInfo.trackNo || '--' }}</span>
          </div>
          <div v-if="trainInfo.columnPosition === '1' || trainInfo.columnPosition === '2'">
            <span>列位：</span>
            <span>{{ trainInfo.columnPosition || '--' }}</span>
          </div>
          <div class="date">
            <span>{{ moduleType === 'OUTSIDE' ? '过车时间：' : '开始时间：' }}</span>
            <span>{{ trainInfo.checkStartDate || '--' }}</span>
          </div>
          <div class="date" v-show="moduleType === 'INSIDE'">
            <span>结束时间：</span>
            <span>{{ trainInfo.checkEndDate || '--' }}</span>
          </div>
          <div>
            <span>故障数：</span>
            <span style="color: #fa6157">
              {{ warningInfo.totalFaultCount ?? '--' }}
            </span>
          </div>
        </div>
        <div class="actions-status-wrap">
          <div class="actions">
            <el-select
              v-model="searchForm.code"
              placeholder="Select"
              style="width: 100px"
              @change="changePassageway"
            >
              <el-option
                v-for="item in passagewayList"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              />
            </el-select>

            <el-button type="primary" @click="exportFault">故障复核单</el-button>
            <el-button type="primary">故障详情</el-button>
            <div style="margin-right: 10px" v-show="showType === 'GRID'">
              <span style="padding: 0 10px">只看异常图</span>
              <el-switch v-model="searchForm.isFault" @change="getData" />
            </div>
          </div>
          <div class="status">
            <div>
              <i class="point" style="background: #4131e9" />
              待复核（{{ warningInfo.reviewCount || 0 }}）
            </div>
            <div>
              <i class="point" style="background: #df392b" />
              确报故障（{{ warningInfo.confirmCount || 0 }}）
            </div>
            <div>
              <i class="point" style="background: #e79d3e" /> 误报故障{{
                warningInfo.falseCount || 0
              }}）
            </div>
          </div>
        </div>
      </div>
      <div
        class="check-data-ks-render"
        v-loading="loading"
        element-loading-background="transparent"
      >
        <KsRender :ksData="ksData" :isVertical="isVertical" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.checkData {
  width: 100%;
  height: 100%;
  overflow: hidden;
  @include flex;
  .check-data-main {
    flex: 1;
    height: 100%;
    @include flex($dir: column, $al: stretch);
    .check-data-top {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 4px;
      padding: 10px 0;
      color: #fff;
      .train-info {
        padding: 0 10px;
        @include flex($jc: flex-start) {
          flex-wrap: wrap;
        }
        > div {
          line-height: 30px;
          font-size: 14px;
          padding: 0 10px;
        }
      }
      .actions-status-wrap {
        padding: 0 20px;
        @include flex($jc: space-between);
        flex-wrap: wrap;
        .actions {
          @include flex($jc: flex-start);
          .el-button {
            margin-left: 10px;
          }
        }
        .status {
          @include flex($jc: flex-end);
          font-size: 14px;
          .point {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
          }
        }
      }
    }

    .check-data-ks-render {
      width: 100%;
      flex: 1;
      overflow: hidden;
    }
  }
}
</style>
