import request from '@/utils/request'
request
/**
 * @description 获取过车列表-检测数据页面
 * @param {*} params
 */

export function getPassTransList(params) {
  return request({
    url: '/api/check/data/passing/page',
    method: 'get',
    params
  })
}

