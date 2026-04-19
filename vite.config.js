import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'sitemap.xml'],
      manifest: {
        name: 'Patna Metro — Route Planner & Schedule',
        short_name: 'Patna Metro',
        description: 'Plan your Patna Metro journey. Fares, timings, map and live station status — free and fast.',
        theme_color: '#1a56db',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        categories: ['travel', 'navigation', 'utilities'],
        lang: 'en-IN',
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // Cache all app assets for offline use
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        runtimeCaching: [
          {
            // Cache navigation requests (app shell)
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
              networkTimeoutSeconds: 3,
            },
          },
        ],
      },
    }),
  ],
})
