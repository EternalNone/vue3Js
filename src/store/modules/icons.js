import { defineStore } from 'pinia'

export const useIconsStore = defineStore('icons', () => {
  const elIcons = ref([])
  const svgs = ref([])
  const icons = computed(() => {
    return [...new Set([...elIcons.value, ...svgs.value])]
  })

  return { elIcons, svgs, icons }
})
