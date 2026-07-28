import { useCallback, useEffect, useState } from 'react'
import { THEME_KEY } from '../lib/storage'

/**
 * 'light' | 'dark' teması. İlk değer index.html'deki inline script ile
 * zaten uygulanmış olur; burada sadece React tarafıyla senkronlarız.
 */
export function useTheme() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')

    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      /* yok say */
    }

    // Tarayıcı çubuğu / Android durum çubuğu rengi. Değerler index.css'teki
    // --bg ile aynı olmalı.
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.content = theme === 'dark' ? '#12161d' : '#f5f2ed'
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme }
}
