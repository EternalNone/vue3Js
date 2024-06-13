<script setup name="Test">
const props = defineProps({
  str: {
    type: String,
    default: ''
  },
  list: {
    type: Array,
    default: () => []
  },
  obj: {
    type: Object,
    default: () => ({})
  }
})
const { str, list, obj } = toRefs(props)
watch(str, () => {
  console.log('str changed')
})
watch(list, () => {
  console.log('list changed')
})

watch(
  obj,
  () => {
    console.log('obj changed')
  },
  { deep: true }
)
</script>

<template>
  <div class="">
    <div>str: {{ str }}</div>
    <div>list: {{ list }}</div>
    <div>obj: {{ obj }}</div>
  </div>
</template>

<style lang="scss" scoped></style>
