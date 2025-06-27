import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    base: process.env.NODE_ENV === 'production'
      ? env.VITE_REPO_NAME || '/'
      : '/',
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@/components': resolve(__dirname, 'src/components'),
        '@/composables': resolve(__dirname, 'src/composables'),
        '@/services': resolve(__dirname, 'src/services'),
        '@/types': resolve(__dirname, 'src/types'),
        '@/utils': resolve(__dirname, 'src/utils'),
        '@/constants': resolve(__dirname, 'src/constants'),
        '@/assets': resolve(__dirname, 'src/assets'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks
            'vue-vendor': ['vue', 'vue-router'],
            'chart-vendor': ['chart.js', 'vue-chartjs', 'chartjs-adapter-date-fns'],
            'ui-vendor': ['@vueuse/core', 'lucide-vue-next'],
            'utils-vendor': ['date-fns', 'axios'],
            
            // Lazy-loaded heavy libraries
            'export-pdf': ['jspdf'],
            'export-canvas': ['html2canvas'],
            'datepicker': ['@vuepic/vue-datepicker'],
          }
        }
      },
      chunkSizeWarningLimit: 1000,
    },
  }
})
