import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/format-converter/',
  plugins: [react( ),tailwindcss()],
  resolve: {
    alias: {
      // 确保这里的路径是绝对路径，并且在所有环境中都能正确解析
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      // 明确告诉 Rollup 如何处理外部模块，这里是为了确保内部模块不被错误地外部化
      external: [],
    },
  },
})
