import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,woff2}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
      includeAssets: ['favicon-32.png', 'apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'FIBERLINKGUARD',
        short_name: 'FIBERLINKGUARD',
        description: 'FTTH fibre management, testing and operations platform',
        theme_color: '#0a0f1a',
        background_color: '#0a0f1a',
        display: 'standalone',
        start_url: '/',
        prefer_related_applications: false,
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
        related_applications: [
          { platform: 'webapp', url: '/manifest.webmanifest', id: '/' }
        ]
      }
    })
  ]
});
