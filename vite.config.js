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
        id: '/',
        name: 'Patna Metro — Route Planner & Schedule',
        short_name: 'Patna Metro',
        description: 'Plan your Patna Metro journey. Fares, timings, map and live station status — free and fast.',
        theme_color: '#1a56db',
        background_color: '#1a56db',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        dir: 'ltr',
        categories: ['travel', 'navigation', 'utilities'],
        lang: 'en-IN',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: '/favicon.svg',  sizes: 'any',     type: 'image/svg+xml', purpose: 'any' },
        ],
        shortcuts: [
          {
            name: 'Plan Route',
            short_name: 'Planner',
            description: 'Plan your Patna Metro journey',
            url: '/',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Train Schedule',
            short_name: 'Schedule',
            description: 'Check Patna Metro train timings',
            url: '/schedule',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Metro Map',
            short_name: 'Map',
            description: 'View Patna Metro network map',
            url: '/map',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }],
          },
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
