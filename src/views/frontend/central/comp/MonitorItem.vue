<script setup name="MonitorItem">
import VideoComp from './VideoComp.vue'
defineProps({
  info: {
    type: Object,
    default: () => ({})
  }
})
</script>

<template>
  <div class="monitor-item">
    <div class="title">{{ info.name }}</div>
    <div class="video-list">
      <VideoComp
        v-for="(item, idx) in info.list"
        :key="item.url"
        :position="item.position"
        :url="item.url"
        :idx="idx"
        :gd="info.gd"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.monitor-item {
  width: calc(50% - 10px);
  padding: 16px;
  border-radius: 2px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background-color: rgba(255, 255, 255, 0.1);
  -webkit-backdrop-filter: blur(5px);
  backdrop-filter: blur(5px);
  .title {
    color: #fff;
    margin-bottom: 10px;
  }
  .video-list {
    @include flex($jc: flex-start, $al: flex-start) {
      flex-wrap: wrap;
      gap: 16px;
    }
  }
}
</style>
