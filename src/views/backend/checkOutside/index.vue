<script setup name="CheckOutside">
import dayjs from 'dayjs'
import ComTable from '@/components/ComTable/index.vue'
import '@/components/types'
import { getPassTransList } from '@/api/passTrain'
import { getTrainTrackApi } from '@/api/central'

/**
 * @type {Column[]}
 */
const columns = [
  {
    label: '车型',
    prop: 'vehicleModel',
    minWidth: 100,
    showInSearch: true
  },
  {
    label: '车号',
    prop: 'carNo',
    minWidth: 100,
    showInSearch: true
  },
  {
    label: '股道',
    prop: 'trackNo',
    minWidth: 100,
    showInSearch: true,
    searchType: 'select',
    searchConfig: {
      qFunc: getTrainTrackApi,
      opsKV: {
        labelKey: 'track',
        valueKey: 'track'
      }
    }
  },
  {
    label: '检测时间',
    prop: 'checkStartDate',
    minWidth: 160,
    hideInTable: true,
    showInSearch: true,
    searchType: 'daterange'
  },
  {
    label: '检测开始时间',
    prop: 'checkStartDate',
    minWidth: 160
  },
  {
    label: '检测结束时间',
    prop: 'checkEndDate',
    minWidth: 160
  },
  {
    label: '检测时长',
    prop: 'duration',
    minWidth: 100,
    slot: 'duration'
  },
  {
    label: '配属单位',
    prop: 'unit',
    minWidth: 150
  },
  {
    label: '编组类型',
    prop: 'bzType',
    minWidth: 100,
    slot: 'bzType'
  },
  {
    label: '辆数',
    prop: 'ls',
    minWidth: 80
  },
  {
    label: '库号',
    prop: 'garageNo',
    minWidth: 100
  },
  {
    label: '列位',
    prop: 'columnPosition',
    minWidth: 80
  },
  {
    label: '端位',
    prop: 'endPosition',
    minWidth: 80,
    slot: 'endPosition'
  },
  {
    label: '方向',
    prop: 'fx',
    minWidth: 80
  },
  {
    label: '作业状态',
    prop: 'zyStatus',
    minWidth: 100
  },
  {
    label: '复核状态',
    prop: 'fhStatus',
    minWidth: 100
  },
  {
    label: '故障数',
    prop: 'count',
    minWidth: 100
  },
  {
    label: '看图',
    prop: 'action',
    minWidth: 120,
    fixed: 'right',
    slot: 'action'
  }
]
/**
 * @type {Options}
 */
const options = {
  showIndex: true,
  selectionType: 'multiple',
  qFunc: getPassTransList,
  initQuery: {
    moduleType: 'INSIDE',
    vehicleModel: '',
    type: '',
    carNo: '',
    trackNo: '',
    startDate: '',
    endDate: ''
  }
}
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
// 获取检测时长
const getDuration = (checkStartDate, checkEndDate) => {
  if (checkStartDate && checkEndDate) {
    const diffMin = dayjs(checkEndDate).diff(dayjs(checkStartDate), 'minute')
    return diffMin ? `${diffMin}min` : '--'
  }
  return '--'
}
</script>
<template>
  <div class="check-outside">
    <ComTable :columns="columns" :options="options">
      <template #tools>
        <el-button type="danger">批量删除</el-button>
      </template>
      <template #duration="{ row }">
        {{ getDuration(row.checkStartDate, row.checkEndDate) }}
      </template>
      <template #endPosition="{ row }">
        {{ `0${row.endPosition ?? 0}` }}
      </template>
      <template #bzType="{ row }">
        {{ getType(row.columnPosition, row.carNo) }}
      </template>
      <template #action>
        <el-button type="primary" link size="small">快扫</el-button>
        <el-button type="primary" link size="small">精扫</el-button>
      </template>
    </ComTable>
  </div>
</template>

<style lang="scss" scoped>
.check-outside {
  width: 100%;
  height: 100%;
}
</style>
