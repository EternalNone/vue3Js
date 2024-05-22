export const useCanvasToolsBar = () => {
  const state = reactive({
    compare: false,
    magnify: false,
    reverse: false,
    editMode: false
  })
  const toggleFunc = (str, val) => {
    state[str] = val ?? !state[str]
  }
  return {
    ...toRefs(state),
    toggleFunc
  }
}
