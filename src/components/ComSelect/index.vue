<script setup name="ComSelect">
import { useVModel, useDebounceFn } from '@vueuse/core'
import { isEqual } from 'radash'
import '@/components/types'
const props = defineProps({
  /**
   * 当前选中的值
   * @type {string | number | boolean | object | Array}
   */
  modelValue: {
    type: [String, Number, Boolean, Object, Array],
    required: true
  },
  /**
   * @type {{dKey:string,dVal:any} | null} [dependence] - 联动查询的依赖项（字段名、值）
   */
  dependence: {
    type: [Object, null],
    default: null
  },
  /**
   * 自定义配置+elment-plus select的配置项
   * @type {SelectConfig}
   */
  config: {
    type: Object,
    default: () => ({})
  }
})
const emits = defineEmits(['update:modelValue', 'change'])
const { config, dependence } = toRefs(props)
const _config = computed(() => {
  return {
    opsKV: {
      labelKey: 'label',
      valueKey: 'value'
    },
    options: [],
    qFunc: null,
    qParams: {},
    remoteKey: '',
    connectKey: [],
    ...config.value
  }
})
const selectedVal = useVModel(props, 'modelValue', emits)
const state = reactive({
  loading: false,
  ops: [],
  queryData: {}
})
const { loading, ops, queryData } = toRefs(state)
watch(
  () => _config.value.qParams,
  (newVal) => {
    queryData.value = newVal
  },
  { deep: true, immediate: true }
)
watch(
  () => _config.value?.options,
  (newVal) => {
    if (!props.qFunc) {
      ops.value = newVal
    }
  },
  { deep: true }
)
// 联动查询
watch(dependence, (newVal, oldVal) => {
  if (newVal?.dKey && !isEqual(newVal, oldVal)) {
    selectedVal.value = _config.value?.multiple ? [] : ''
    getOps({ ...queryData.value, [newVal.dKey]: newVal.dVal })
  }
})
onBeforeMount(() => {
  if (!_config.value?.remoteKey) {
    getOps(queryData.value)
  }
})
// 获取下拉选项文本
const getLabel = (op) => {
  let labelText = op[_config.value.opsKV.labelKey]
  if (_config.value?.connectKey?.length) {
    _config.value?.connectKey?.forEach((key) => {
      const curKey = op[key] ? ` | ${op[key]}` : ''
      labelText += curKey
    })
  }
  return labelText
}
// 查询选项
const getOps = (params) => {
  if (props?.config?.qFunc) {
    loading.value = true
    props.config
      .qFunc(params)
      .then((res) => {
        ops.value = res?.data || []
      })
      .finally(() => {
        loading.value = false
      })
  }
}
const debounceFun = useDebounceFn((obj) => {
  getOps(obj)
}, 1500)
// 远程搜索
const remoteMethod = async (keyWords) => {
  if (_config.value?.remoteKey) {
    queryData.value[_config.value.remoteKey] = keyWords
    debounceFun(queryData.value)
  }
}
const handleChange = (val) => {
  const curOp = ops.value?.find((i) => i[_config.value?.opsKV?.valueKey] === val)
  emits('change', { val, op: curOp })
}
</script>

<template>
  <ElSelect
    class="com-select"
    v-model="selectedVal"
    clearable
    collapse-tags
    collapse-tags-tooltip
    autocomplete="off"
    placeholder="请选择"
    reserve-keyword
    :loading="loading"
    remote-show-suffix
    filterable
    :remote="Boolean(_config?.remoteKey && _config?.remoteKey !== '')"
    :remote-method="_config?.remoteKey ? remoteMethod : undefined"
    v-bind="config"
    @change="handleChange"
  >
    <ElOption
      v-for="op in ops"
      :key="op[_config.opsKV.valueKey]"
      :label="getLabel(op)"
      :value="op[_config.opsKV.valueKey]"
    />
  </ElSelect>
</template>

<style lang="scss" scoped>
.com-select {
  width: 100%;
}
</style>
