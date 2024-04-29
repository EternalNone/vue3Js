import request from '@/utils/request'

/**
 * @description 登录
 * @param {*} data 
 * @returns 
 */
export function loginApi(data) {
  return request({
    url: '/api/user/login',
    method: 'post',
    data
  })
}
