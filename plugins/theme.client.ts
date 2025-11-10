// plugins/theme.client.ts
export default defineNuxtPlugin(() => {
  const KEY = 'clinic-theme'
  const html = document.querySelector('html')
  const saved = localStorage.getItem(KEY) // 'dark' | 'light' | null
  if (saved === 'dark') html?.classList.add('v-theme--dark')

  return {
    provide: {
      themeStorage: {
        get: () => (localStorage.getItem(KEY) ?? 'light'),
        set: (mode: 'dark'|'light') => {
          localStorage.setItem(KEY, mode)
          if (mode === 'dark') html?.classList.add('v-theme--dark')
          else html?.classList.remove('v-theme--dark')
        }
      }
    }
  }
})
