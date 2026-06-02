import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {VitePWA} from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({}), 
    VitePWA({
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    devOptions: {
      enabled: true
    },
    workbox: {
      navigateFallback: '/index.html',
      runtimeCaching: [{
        urlPattern: ({ url }) => url.pathname.startsWith('/recipes'),
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-data-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 
        },
         cacheableResponse: {
                statuses: [0, 200]
          },
      }},
      {
        urlPattern: ({ url }) => url.pathname.startsWith('/users'),
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-data-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 
        },
         cacheableResponse: {
                statuses: [0, 200]
          },
      }},
      ]
    },
  })
],
})
