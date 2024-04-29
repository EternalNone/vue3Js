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
