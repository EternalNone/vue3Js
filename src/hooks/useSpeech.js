export const useSpeech = () => {
  let speech = new SpeechSynthesisUtterance()
  const play = (text, ...rest) => {
    let n = 1
    let waiting = false
    rest.forEach((arg) => {
      if (typeof arg === 'number') {
        n = arg
      } else if (typeof arg === 'boolean') {
        waiting = arg
      }
    })
    if (!text) {
      return
    }
    if (!waiting) {
      // 直接暂停未播完的语音开始播放新语音
      window.speechSynthesis.cancel()
    }
    speech.text = text.repeat(n)
    speech.lang = 'zh-CN'
    speech.volume = 1
    speech.rate = 1
    speech.pitch = 1
    window.speechSynthesis.speak(speech)
  }
  const stop = () => {
    window.speechSynthesis.cancel()
  }
  const pause = () => {
    window.speechSynthesis.pause()
  }
  const resume = () => {
    window.speechSynthesis.resume()
  }
  onUnmounted(() => {
    stop()
    speech = null
  })
  return { play, stop, pause, resume }
}
