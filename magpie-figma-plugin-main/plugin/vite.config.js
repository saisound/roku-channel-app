import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    emptyOutDir: false,
    outDir: '../dist',
    lib: {
      entry: './index.ts',
      formats: ['es'],
      fileName: 'plugin'
    },
  }
});
