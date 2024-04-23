<script setup>
defineProps({
  name: { type: String, required: true },
  color: { type: String, default: '#eeeeee' },
  size: { type: Number, default: 24 }
})
</script>
<template>
  <svg
    class="svg-icon"
    :style="{
      color,
      fontSize: `${size}px`
    }"
    aria-hidden="true"
  >
    <use :xlink:href="`#icon-${name}`" />
  </svg>
</template>

<style scoped lang="scss">
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
