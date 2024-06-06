<script setup name="VideoComp">
import { Loading } from '@element-plus/icons-vue'
const WebRtcStreamer = window.WebRtcStreamer
const props = defineProps({
  url: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: ''
  },
  gd: {
    type: String,
    default: ''
  },
  idx: {
    type: Number,
    default: 1
  }
})
const state = reactive({
  showInitBtn: true,
  webRtcServer: null
})
const { showInitBtn, webRtcServer } = toRefs(state)
onUnmounted(() => {
  if (webRtcServer.value) {
    webRtcServer.value?.disconnect()
    webRtcServer.value = null
  }
})
const init = () => {
  showInitBtn.value = false
  webRtcServer.value = new WebRtcStreamer(`${props.gd}-${props.idx}`, location.origin)
  webRtcServer.value.connect(props.url, undefined, {
    options: 'rtptransport=tcp&timeout=60'
  })
}
</script>

<template>
  <div class="video-comp">
    <video :id="`${gd}-${idx}`" :ref="`${gd}-${idx}`" muted controls :autoplay="false"></video>
    <div v-show="showInitBtn" class="init-btn" @click="init">
      <el-icon :size="20" color="#fff"><Loading /></el-icon>
    </div>
    <div class="video-title">{{ `${gd}列位-${position}` }}</div>
  </div>
</template>

<style lang="scss" scoped>
.video-comp {
  width: calc(50% - 8px);
  height: 100%;
  position: relative;
  .init-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    position: absolute;
    left: 50%;
    top: 35%;
    transform: translate(-50%, -50%);
    cursor: pointer;
    color: #fff;
    letter-spacing: 2px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(5px);
    @include flex;
  }
  video {
    width: 100%;
    object-fit: fill;
    height: auto;
    aspect-ratio: 1.5;
  }
  .video-title {
    width: 100%;
    font-size: 14px;
    padding: 10px 0;
    color: #fff;
    line-height: 1;
    font-weight: 600;
    text-align: center;
  }
}
</style>
../../../../../public/webrtcstreamer.js
