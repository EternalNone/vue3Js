import dayjs from 'dayjs'

/** 格式化时间 */
export const formatDateTime = (time, formatType = 'YYYY-MM-DD HH:mm:ss') => {
  return time ? dayjs(new Date(time)).format(formatType) : '--'
}
