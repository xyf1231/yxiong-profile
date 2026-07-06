import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.tsx'),
      name: 'LettersAnimation',
      fileName: 'letters-animation',
      formats: ['umd']
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
        inlineDynamicImports: true
      }
    },
    outDir: '../js/letters-dist',
    emptyOutDir: true,
    minify: false,
    sourcemap: true
  }
})
