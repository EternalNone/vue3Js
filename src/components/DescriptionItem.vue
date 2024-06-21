<script setup name="DescriptionItem">
defineProps({
  label: {
    type: String,
    default: ''
  },
  labelClss: {
    type: String,
    default: ''
  },
  contentClss: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div class="description-item">
    <div class="desc-label" :class="labelClss">
      <slot v-if="$slots.label" name="label"></slot>
      <span v-else>{{ label }}</span>
    </div>
    <div class="desc-content" :class="contentClss">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.description-item {
  width: 100%;
  @include flex($jc: flex-start, $al: stretch);
  border: 1px solid var(--el-border-color-lighter);
  box-sizing: border-box;
  .desc-label {
    min-width: 100px;
    height: auto;
    flex-shrink: 0;
    padding: 8px 10px;
    background: var(--el-fill-color-light);
    color: var(--el-text-color-regular);
    text-align: center;
    line-height: 24px;
    font-weight: 600;
    border-right: 1px solid var(--el-border-color-lighter);
    > span {
      font-weight: 600;
    }
  }
  .desc-content {
    flex: 1;
    white-space: normal;
    word-break: break-all;
    word-wrap: break-word;
    padding: 8px 10px;
  }
  & + .description-item {
    border-top: none;
  }
}
</style>
