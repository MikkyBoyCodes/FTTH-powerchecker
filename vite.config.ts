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
      includeAssets: ['favicon-32.png', 'favicon-48.png', 'apple-touch-icon.png'],
      devOptions: {
        enabled: true,
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,woff,woff2}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
      manifest: {
        id: '/',
        name: 'FIBERLINKGUARD — FTTH Operations Platform',
        short_name: 'FIBERLINKGUARD',
        description:
          'FTTH fibre management, testing and operations platform. Power checking, fault isolation, Bluetooth smart testing, inventory, provisioning and live monitoring — works offline.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'any',
        lang: 'en',
        dir: 'ltr',
        categories: ['utilities', 'productivity', 'business'],
        theme_color: '#0a0f1a',
        background_color: '#0a0f1a',
        prefer_related_applications: false,
        icons: [
          {
            src: '/fiberlinkguard-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/fiberlinkguard-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/fiberlinkguard-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: '/screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'FIBERLINKGUARD power check on desktop',
          },
          {
            src: '/screenshot-narrow.png',
            sizes: '750x1334',
            type: 'image/png',
            label: 'FIBERLINKGUARD power check on mobile',
          },
        ],
        related_applications: [{ platform: 'webapp', url: '/manifest.webmanifest', id: '/' }],
      },
    }),
  ],
});
