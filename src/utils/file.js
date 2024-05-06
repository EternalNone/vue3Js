/**
 * @description 下载文件
 * @param data 文件数据
 * @param filename 文件名
 * @param type 文件流类型
 */
export const download = (data, filename, type) => {
  if (window.navigator.msSaveOrOpenBlob) {
    const blob = new Blob([data], { type })
    navigator.msSaveBlob(blob, filename)
  } else {
    let url = window.URL.createObjectURL(data)
    let link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }
}
