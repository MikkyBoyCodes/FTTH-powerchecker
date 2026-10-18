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
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,woff2}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
      includeAssets: ['fiberlinkguard-mark.svg'],
      manifest: {
        name: 'FIBERLINKGUARD',
        short_name: 'FIBERLINKGUARD',
        description: 'FTTH fibre management, testing and operations platform',
        theme_color: '#0a0f1a',
        background_color: '#0a0f1a',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/fiberlinkguard-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/fiberlinkguard-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          { src: '/fiberlinkguard-mark.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
        ]
      }
    })
  ]
});
