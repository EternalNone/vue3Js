import request from '@/utils/request'

/**
 * @description 登录
 * @param {*} data
 * @returns
 */
export const loginApi = (data) => {
  return request({
    url: '/api/sys/user/login',
    method: 'post',
    data
  })
}
/**
 * @description 登出
 * @param {*} data
 * @returns
 */
export const logOutApi = (data={}) => {
  return request({
    url: '/api/sys/user/logout',
    method: 'post',
    data
  })
}
