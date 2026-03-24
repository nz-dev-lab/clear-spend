/**
 * context/ThemeContext.tsx — Dark / Light mode state
 *
 * Provides a global toggle for dark/light mode.
 * The preference is saved to localStorage so it persists when the page refreshes.
 *
 * How it works:
 *   - When dark mode is on, the class "dark" is added to the <html> element
 *   - Tailwind's darkMode: 'class' config picks this up and applies dark: variants
 *   - Any component can call useTheme() to get the current mode or toggle it
 */

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Read saved preference, default to 'light' if nothing saved
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) ?? 'light'
  )

  // Apply or remove the 'dark' class on <html> whenever theme changes
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () =>
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

/** Hook to access the theme and toggle function from any component */
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
