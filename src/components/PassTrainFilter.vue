<script setup name="PassTrainFilter">
import dayjs from 'dayjs'
import { useGlobalStore } from '@/store/modules/global'
import { getPassTransList } from '@/api/passTrain'

const globalStore = useGlobalStore()
const { moduleType } = storeToRefs(globalStore)

const quickSearchItems = [
  {
    title: '近10趟',
    value: 'LATEST_TEN_COUNT'
  },
  {
    title: '近15天',
    value: 'LATEST_FIFTEEN_DAY'
  }
]
const emits = defineEmits(['getPassTrainData'])
const state = reactive({
  transList: [],
  currentData: {},
  loading: false,
  noMore: false,
  expand: true, // 筛选栏是否展开
  vehicleModel: '', // 车型
  type: '', // 检测类型：TODAY—当天数据，LATEST_TEN_COUNT-最新10条数据，LATEST_FIFTEEN_DAY-最近15天
  carNo: '', // 车号
  gd: '', // 股道
  transDate: [], // 日期
  pageInfo: {
    page: 0,
    pageSize: 40,
    total: 0
  },
  tranTimer: null
})

const {
  transList,
  currentData,
  loading,
  noMore,
  expand,
  pageInfo,
  vehicleModel,
  type,
  carNo,
  gd,
  transDate,
  tranTimer
} = toRefs(state)
const disabled = computed(() => loading.value || noMore.value)
watch(moduleType, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    search()
  }
})
onMounted(() => {
  loadTrain()
})
onUnmounted(() => {
  if (tranTimer.value) {
    clearTimeout(tranTimer.value)
    tranTimer.value = null
  }
})
// 选中过车列表
const selectTransItem = (item) => {
  currentData.value = item
  emits('getPassTrainData', item)
}

// 清空数据列表，重置默认选择，重置默认加载，清空默认选择

const search = () => {
  pageInfo.value.page = 0
  pageInfo.value.pageSize = type.value === 'LATEST_TEN_COUNT' ? 10 : 40
  pageInfo.value.total = 0
  selectTransItem({})
  transList.value = []
  loadTrain()
}
// 查询过车列表
const getList = () => {
  const { page, pageSize, total } = pageInfo.value
  const param = {
    moduleType: moduleType.value,
    vehicleModel: vehicleModel.value,
    type: type.value,
    carNo: carNo.value,
    startDate: transDate.value?.[0] || '',
    endDate: transDate.value?.[1] || '',
    page,
    pageSize
  }
  loading.value = true
  getPassTransList(param)
    .then((res) => {
      if (res?.data?.total !== total) {
        pageInfo.value.total = res.data.total
        transList.value = res?.data?.records || []
        // 默认选择第一项
        if (res?.data?.records?.length) {
          selectTransItem(res.data.records[0])
        } else {
          selectTransItem({})
        }

        //近10趟没有分页
        if (type.value === 'LATEST_TEN_COUNT') {
          noMore.value = true
        } else {
          noMore.value = false
        }
      } else {
        if (res?.data?.total > transList.value.length) {
          transList.value = [...transList.value, ...res.data.records]
          noMore.value = false
        } else {
          // 没有数据
          noMore.value = true
        }
      }
    })
    .finally(() => {
      loading.value = false
    })
}
// 加载更多过车列表
const loadTrain = () => {
  if (transList.value.length < pageInfo.value.total || transList.value.length === 0) {
    if (transList.value.length > 9 && type.value === 'LATEST_TEN_COUNT') {
      // 近10趟场景边界处理
      return
    }
    // 开启加载状态
    loading.value = true
    noMore.value = false

    if (tranTimer.value) {
      clearTimeout(tranTimer.value)
    }
    tranTimer.value = setTimeout(() => {
      pageInfo.value.page++
      getList()
    }, 1000)
  } else {
    loading.value = false
    noMore.value = true
  }
}
// 快捷搜索
const quickSearchChange = (val) => {
  if (val === type.value) return
  type.value = val
  if (val === 'LATEST_FIFTEEN_DAY') {
    const endDate = dayjs().format('YYYY-MM-DD')
    const startDate = dayjs().subtract(15, 'day').format('YYYY-MM-DD')
    transDate.value = [startDate, endDate]
  } else if (val === 'LATEST_TEN_COUNT') {
    transDate.value = []
  }
  search()
}
// 日期修改
const dateChange = () => {
  type.value = '' // 清空检测类型
  search()
}
// 重置
const reset = () => {
  vehicleModel.value = ''
  type.value = ''
  carNo.value = ''
  transDate.value = []
  search()
}
const toggleFilter = () => {
  expand.value = !expand.value
}
</script>

<template>
  <div :class="expand ? 'filter-wrap' : 'filter-wrap filter-wrap-hidden'">
    <div class="title">
      <span>过车信息筛选</span>
    </div>
    <div class="search-form">
      <div class="quick-search">
        <div
          v-for="item in quickSearchItems"
          :key="item.value"
          :class="item.value === type ? 'quick-search-item active' : 'quick-search-item'"
          @click="quickSearchChange(item.value)"
        >
          {{ item.title }}
        </div>
      </div>
      <el-date-picker
        v-model="transDate"
        type="daterange"
        range-separator="~"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        @change="dateChange"
      />
      <div class="train-type-no">
        <el-input v-model="vehicleModel" placeholder="车型" clearable @keydown.enter="search" />
        <el-input v-model="carNo" placeholder="车号" clearable @keydown.enter="search" />
        <el-input v-model="gd" placeholder="股道" clearable @keydown.enter="search" />
      </div>
      <div class="btns">
        <el-button type="primary" @click="search">搜索</el-button>
        <el-button type="primary" plain @click="reset">重置</el-button>
      </div>
    </div>
    <div class="search-list">
      <div class="list-title">
        <div class="status"></div>
        <div class="checkInDate">库检时间</div>
        <div class="vehicleModel">车型</div>
        <div class="carNo">车号</div>
        <div class="trackNo">股道</div>
      </div>
      <div
        class="list-content"
        v-infinite-scroll="loadTrain"
        :infinite-scroll-disabled="disabled"
        :infinite-scroll-distance="30"
        :infinite-scroll-immediate="false"
      >
        <div
          v-for="(item, indx) in transList"
          :key="indx"
          :class="{ active: currentData && item.trainNo === currentData?.trainNo }"
          @click="selectTransItem(item)"
        >
          <i
            class="status"
            :style="{
              background:
                moduleType === 'OUTSIDE' || item.checkEndDate
                  ? 'var(--el-color-success)'
                  : 'var(--el-color-danger)'
            }"
          />
          <div class="checkInDate">{{ item.checkInDate || '--' }}</div>
          <el-tooltip effect="dark" :content="item.vehicleModel" placement="top" :hide-after="0">
            <div class="vehicleModel">{{ item.vehicleModel || '--' }}</div>
          </el-tooltip>
          <el-tooltip effect="dark" :content="item.carNo" placement="top" :hide-after="0">
            <div class="carNo">{{ item.carNo || '--' }}</div>
          </el-tooltip>
          <div class="trackNo">{{ item.trackNo || '--' }}</div>
        </div>
        <p v-show="loading" class="text_center border">加载中...</p>
        <p v-show="noMore" class="text_center border">{{ `共${pageInfo.total}条数据` }}</p>
      </div>
    </div>
  </div>
  <div :class="expand ? 'toggle-btn' : 'toggle-btn expand-btn'" @click="toggleFilter">
    <SvgIcon :name="expand ? 'fold' : 'expand'" />
  </div>
</template>

<style lang="scss" scoped>
.filter-wrap {
  @include flex($dir: column, $jc: flex-start, $al: center);
  width: 380px;
  height: 100%;
  margin-right: 20px;
  padding: 10px 0;
  flex-shrink: 0;
  background: linear-gradient(180deg, rgba(17, 209, 251, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%);
  border-radius: 4px;
  border: 1px solid;
  border-image: linear-gradient(
      45deg,
      rgb(17, 209, 251),
      rgba(17, 209, 251, 0.1),
      rgb(17, 209, 251)
    )
    1 1;
  &.filter-wrap-hidden {
    display: none;
  }
  .title {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-color-primary);
    line-height: 20px;
    letter-spacing: 1px;
    padding: 0 10px;
  }
  .search-form {
    margin: 10px 0;
    padding: 0 10px;
    .quick-search {
      @include flex;
      width: 100%;
      height: 34px;
      line-height: 34px;
      border-radius: 4px;
      overflow: hidden;
      font-size: 14px;
      .quick-search-item {
        width: 50%;
        height: 100%;
        text-align: center;
        background-color: rgba(255, 255, 255, 0.2);
        color: #fff;
        cursor: pointer;
        transition: all 0.3s;
        &:hover {
          color: var(--el-color-primary);
        }
        &.active {
          background-color: var(--el-color-primary);
          color: #fff;
        }
        &:last-child {
          border-left: 1px solid #fff;
        }
      }
    }
    :deep(.el-date-editor) {
      width: 100%;
      height: 34px;
      margin-top: 10px;
      --el-input-bg-color: transparent;
      --el-input-border-color: #fff;
      --el-input-hover-border-color: #fff;
      .el-range__icon,
      .el-range-separator {
        color: #fff;
      }
      .el-range-input {
        color: #fff;
      }
    }
    .train-type-no {
      margin-top: 10px;
      @include flex;
      .el-input {
        height: 34px;
        --el-input-bg-color: transparent;
        --el-input-text-color: #fff;
        --el-input-border-color: #fff;
        --el-input-hover-border-color: #fff;
        &:nth-child(2) {
          margin: 0 10px;
        }
      }
    }
    .btns {
      margin-top: 10px;
      @include flex;
      .el-button {
        flex: 1;
        height: 34px;
        &:last-child {
          --el-button-bg-color: transparent;
          --el-button-border-color: #fff;
          --el-button-text-color: #fff;
        }
      }
    }
  }
  .search-list {
    width: 100%;
    flex: 1;
    .list-title {
      width: 100%;
      height: 40px;
      padding: 0 10px;
      @include flex($jc: flex-start);
      color: #fff;
      background: linear-gradient(
        180deg,
        rgba(17, 181, 222, 0.2784313725) 0%,
        rgba(17, 181, 222, 0) 52%,
        rgba(17, 181, 222, 0.3411764706) 100%
      );
    }
    .list-content {
      width: 100%;
      height: calc(100vh - 436px);
      overflow-y: auto;
      @include scrollBar(
        $color: var(--el-color-primary-light-5),
        $activeColor: var(--el-color-primary)
      );
      > div {
        width: 100%;
        height: 40px;
        padding-left: 10px;
        @include flex($jc: flex-start);
        color: #fff;
        cursor: pointer;
        border-bottom: 1px dotted rgba(186, 208, 241, 0.5);
        &:nth-child(even) {
          background: rgba(186, 208, 241, 0.1);
        }
        &:hover {
          background: var(--el-color-primary);
        }
        &.active {
          background: var(--el-color-primary);
        }
        > div {
          flex-shrink: 0;
        }
      }
      .text_center {
        width: 100%;
        text-align: center;
        color: #fff;
        line-height: 40px;
      }
    }
    .status {
      width: 10px;
      height: 10px;
      margin-right: 5px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .checkInDate {
      width: 142px;
    }
    .vehicleModel {
      width: 80px;
      @include textEllipsis;
    }
    .carNo {
      width: 80px;
      @include textEllipsis;
    }
    .trackNo {
      width: 40px;
    }
  }
}
.toggle-btn {
  width: 30px;
  height: 30px;
  @include flex;
  position: fixed;
  left: 385px;
  top: 50vh;
  z-index: 1000;
  cursor: pointer;
  &.expand-btn {
    left: 0;
  }
  .svg-icon {
    color: var(--el-color-primary);
    font-size: 30px;
  }
}
</style>
