import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const proxyTarget = env.VITE_PROXY_TARGET || 'https://api.magiculus.com'

  console.log('[Vite] API proxy ->', proxyTarget)

  const proxyOptions = {
    target: proxyTarget,
    changeOrigin: true,
    secure: true,
    ws: true,
    cookieDomainRewrite: 'localhost',

    configure(proxy) {
      proxy.on('proxyReq', (proxyReq, req) => {
        console.log(`→ ${req.method} ${req.url}`)
      })

      proxy.on('proxyRes', (proxyRes, req) => {
        console.log(`← ${proxyRes.statusCode} ${req.method} ${req.url}`)
      })

      proxy.on('error', err => {
        console.error('[Proxy Error]', err.message)
      })
    },
  }

  return {
    plugins: [vue(), vueDevTools()],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
                @use "@/assets/styles/globals" as *;
          `,
        },
      },
    },

    server: {
      host: '0.0.0.0',
      port: 8080,
      strictPort: true,
      https: false,

      proxy: {
        '/api': proxyOptions,
        // '/auth': proxyOptions,
        '/sanctum': proxyOptions,
      },
    },
  }
})
