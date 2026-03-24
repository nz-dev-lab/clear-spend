/**
 * tailwind.config.js — Tailwind CSS configuration
 *
 * Key settings:
 *   - darkMode: 'class' means dark mode is toggled by adding the 'dark' class
 *     to the <html> element — not by the OS preference
 *   - content: tells Tailwind which files to scan so unused styles get removed in production
 *   - theme: extends with our teal brand color and custom font
 */

/** @type {import('tailwindcss').Config} */
export default {
  // Dark mode is controlled by adding/removing the 'dark' class on <html>
  darkMode: 'class',

  // Files Tailwind should scan for class names
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      // Teal as our primary brand color (maps to Tailwind's built-in teal palette)
      colors: {
        primary: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // main brand teal
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
      },
      // Smooth transitions for dark/light mode switching
      transitionProperty: {
        colors: 'color, background-color, border-color',
      },
    },
  },

  plugins: [],
}
