import {onMounted, ref, watch} from 'vue'
import {usePreferredDark, useStorage} from '@vueuse/core'

export function useTheme() {
  const prefersDark = usePreferredDark()
  const storedTheme = useStorage('theme', 'system')
  const isDark = ref(false)

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    storedTheme.value = theme
    updateTheme()
  }

  const updateTheme = () => {
    if (storedTheme.value === 'system') {
      isDark.value = prefersDark.value
    } else {
      isDark.value = storedTheme.value === 'dark'
    }

    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  watch(prefersDark, updateTheme)
  watch(storedTheme, updateTheme)

  onMounted(updateTheme)

  return {
    isDark,
    theme: storedTheme,
    setTheme
  }
}
