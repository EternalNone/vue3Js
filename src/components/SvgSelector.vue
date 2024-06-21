<script setup name="SvgSelector">
import { ArrowDown, ArrowUp, CircleClose } from '@element-plus/icons-vue'
import { useVModel, useEventListener } from '@vueuse/core'
import { useIconsStore } from '@/store/modules/icons'
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})
const emits = defineEmits(['update:modelValue'])
const iconsStore = useIconsStore()
const { icons } = storeToRefs(iconsStore)
const visible = ref(false)
const selectedIcon = useVModel(props, 'modelValue', emits)

const handleSelect = (val) => {
  selectedIcon.value = val
  visible.value = false
}
const handleClear = () => {
  selectedIcon.value = ''
}
useEventListener(document, 'click', (e) => {
  const selectEl = document.querySelector('.svg-selector-popover')
  const trigger = document.querySelector('.svg-selector-trigger')
  if (trigger.contains(e.target)) {
    visible.value = !visible.value
  } else if (!selectEl?.contains(e.target) && visible.value) {
    visible.value = false
  }
})
const handleBlur = (e) => {
  const selectEl = document.querySelector('.svg-selector-popover')
  if (e.relatedTarget && selectEl?.contains(e.relatedTarget)) {
    return
  }
  visible.value = false
}
</script>

<template>
  <el-popover popper-class="svg-selector-popover" title="图标选择" :width="400" :visible="visible">
    <template #reference>
      <el-input
        v-model="selectedIcon"
        class="svg-selector-trigger"
        placeholder="请选择"
        readonly
        :suffix-icon="visible ? ArrowUp : ArrowDown"
        @blur="handleBlur"
      >
        <template #prepend>
          <SvgIcon :name="selectedIcon" color="var(--el-color-primary)" :size="20" />
        </template>
        <template #append>
          <el-button
            :disabled="selectedIcon === ''"
            :icon="CircleClose"
            @click.stop="handleClear"
          />
        </template>
      </el-input>
    </template>
    <ul class="svg-selector-list">
      <li v-for="name in icons" :key="name" @click="handleSelect(name)">
        <SvgIcon :name="name" color="var(--el-text-color-regular)" />
      </li>
    </ul>
  </el-popover>
</template>

<style lang="scss" scoped>
.svg-selector-trigger {
  cursor: pointer;
}
.svg-selector-list {
  width: 100%;
  max-height: 300px;
  border-top: 1px solid var(--el-border-color-light);
  border-left: 1px solid var(--el-border-color-light);
  overflow-y: auto;
  @include scrollBar;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  li {
    padding: 20px 0;
    @include flex;
    border-bottom: 1px solid var(--el-border-color-light);
    border-right: 1px solid var(--el-border-color-light);
    cursor: pointer;
    &:hover {
      background-color: var(--el-color-primary-light-7);
    }
  }
}
</style>
