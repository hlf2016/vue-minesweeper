export const isDev = ref(false)
// 切换开发模式 使用 vueuse
export const toggleDev = useToggle(isDev)
