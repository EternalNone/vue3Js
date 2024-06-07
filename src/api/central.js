import request from '@/utils/request'

/** 股道列表信息
 * @param {*} params
 * @returns
 */
export const getTrainTrackApi = (params) => {
  return request({
    url: '/api/centralize/track',
    method: 'get',
    params
  })
}
/** 机器人操作
 * @param {*} data
 * @returns
 */
export const robotOperate = (command, data) => {
  return request({
    url: '/api/centralize/' + command,
    method: 'post',
    data
  })
}

/** 开始作业密码校验
 * @param {*} params
 * @returns
 */
export const workValid = (params) => {
  return request({
    url: '/api/centralize/work/valid',
    method: 'get',
    params
  })
}

/** 出车
 * @param {*} data
 * @returns
 */
export const checkout = (data) => {
  return request({
    url: '/api/centralize/train/checkout',
    method: 'post',
    data
  })
}

/** 手动接车
 * @param {*} data
 * @returns
 */
export const checkin = (data) => {
  return request({
    url: '/api/centralize/train/checkin',
    method: 'post',
    data
  })
}