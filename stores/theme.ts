import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)

  function load() {
    const saved = localStorage.getItem('memoir_theme')
    if (saved) {
      isDark.value = saved === 'dark'
    } else {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  }

  function toggle() {
    isDark.value = !isDark.value
    localStorage.setItem('memoir_theme', isDark.value ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  }

  return { isDark, load, toggle }
})
