import request from '@/utils/request'

/**
 * @description 获取检测数据页面图片及故障列表
 * @param {*} params
 * @returns
 */
export function getCheckDataPicList(params) {
  return request({
    url: '/api/check/data/pic',
    method: 'get',
    params
  })
}
/**
 * 检测数据通道查询
 * @param {*} params
 * @returns
 */
export function getPassageway(params) {
  return request({
    url: '/api/check/data/passageway',
    method: 'get',
    params
  })
}
/**
 * @description 故障复核单导出
 * @param {String} lcxxBh
 */
export function faultReviewExport(lcxxBh) {
  return request({
    url: '/api/export/fault/form/' + lcxxBh,
    method: 'get',
    params: {},
    responseType: 'blob'
  })
}

/**
 * @description 获取检测数据页面故障统计
 * @param {*} params
 * @returns
 */
export function getCheckDataStatics(params) {
  return request({
    url: '/api/check/data/stat',
    method: 'get',
    params
  })
}
/**
 * @description 获取所有故障列表（快扫加精扫）
 * @param {*} data 

 */

export function getFaultsList(data) {
  return request({
    url: '/api/fine/getFaultsDetails',
    method: 'post',
    data
  })
}

/**
 * @description 删除故障
 * @param {*} id
 */

export function deleteFault(id) {
  return request({
    url: '/api/fine/deleteCarPassFalutDetailByRobot/' + id,
    method: 'post',
    data: {}
  })
}

/**
 * @description 单个故障复核单导出 传故障id
 * @param {*} params
 */
export function exportFaultSingle (params) {
  return request({
    url: '/api/export/robotFaultDownload',
    method: 'get',
    params,
    responseType: 'blob'
  })
}