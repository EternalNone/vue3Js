import request from '@/utils/request'
/**
 * @description 获取统计分析页面报警统计数据
 * @param {*} params
 */

export function getWarnStatics(params) {
  return request({
    url: '/api/check/warn/stat',
    method: 'get',
    params
  })
}
  /**
   * @description 获取数据预警列表
   * @param {*} params 
   */

  export function getTableList(params) {
    return request({
      url: '/api/check/warn/page',
      method: 'get',
      params
    })
  }