<script setup>
import { useIconsStore } from '@/store/modules/icons'
defineProps({
  name: { type: String, required: true },
  color: { type: String, default: '#eeeeee' },
  size: { type: Number, default: 24 }
})
const iconsStore = useIconsStore()
const { elIcons } = storeToRefs(iconsStore)
</script>
<template>
  <!-- 适配element-plus图标 -->
  <component
    v-if="elIcons.includes(name)"
    class="svg-icon"
    :is="name"
    :style="{ '--prop-color': color, '--prop-size': size + 'px' }"
  />
  <!-- 自定义svg -->
  <svg
    v-else
    class="svg-icon"
    aria-hidden="true"
    :style="{ '--prop-color': color, '--prop-size': size + 'px' }"
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
  color: var(--prop-color);
  font-size: var(--prop-size);
}
</style>
