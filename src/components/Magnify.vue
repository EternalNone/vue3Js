<script setup name="Magnify">
const props = defineProps({
  size: {
    type: Number,
    default: 250
  }
})
const sizePx = computed(() => `${props.size}px`)
</script>

<template>
  <div ref="zoomLayerRef" class="zoom-layer"></div>
</template>

<style lang="scss" scoped>
.zoom-layer {
  position: absolute;
  z-index: 101;
  width: v-bind(sizePx);
  height: v-bind(sizePx);
  border-radius: 50%;
  background-position: center center;
  background-repeat: no-repeat;
  border: 1px solid #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  // transform: translate(-50%, -50%);
  cursor: zoom-in;
  pointer-events: none;
}
</style>
