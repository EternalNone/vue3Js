<script setup name="Magnify">
const props = defineProps({
  size: {
    type: Number,
    default: 250
  },
  bgPath: {
    type: String,
    default: '',
    required: false
  }
})
const sizePx = computed(() => `${props.size}px`)
</script>

<template>
  <div ref="zoomLayerRef" class="zoom-layer" :style="{ backgroundImage: `url(${bgPath})` }"></div>
</template>

<style lang="scss" scoped>
.zoom-layer {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 103;
  width: v-bind(sizePx);
  height: v-bind(sizePx);
  // border-radius: 50%;
  background-position: center center;
  background-repeat: no-repeat;
  border: 2px solid #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  cursor: zoom-in;
  pointer-events: none;
}
</style>
