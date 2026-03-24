// postcss.config.cjs — PostCSS plugins required by Tailwind CSS
// Using .cjs because the client uses "type": "module" and PostCSS needs CommonJS format
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}, // automatically adds vendor prefixes for browser compatibility
  },
}
