import request from '@/utils/request'

export function loginApi(data) {
  return request({
    url: '/api/user/login',
    method: 'post',
    data
  })
}
