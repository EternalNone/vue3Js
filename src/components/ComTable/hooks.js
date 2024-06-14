export const useMultiSelection = (comTableRef) => {
  const rowSelections = ref([])
  const selectionChange = (val) => {
    rowSelections.value = val
  }
  const selectionClear = () => {
    comTableRef.value?.clearSelection()
  }
  return { rowSelections, selectionChange, selectionClear }
}
export const useSingleSelection = (rowKey) => {
  const singleSelectionKey = ref('')
  const singleSelect = (curRow) => {
    singleSelectionKey.value = curRow[rowKey]
  }
  return { singleSelectionKey, singleSelect }
}

export const usePagination = () => {
  const page = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  const pagiChange = (curPage, curSize) => {
    page.value = curPage
    pageSize.value = curSize
  }
  const totalChange = (val) => {
    total.value = val
  }
  return { page, pageSize, total, pagiChange, totalChange }
}
