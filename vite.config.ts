import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.celo\.org\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'celo-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheKeyWillBeUsed: async ({ request }) => {
                return `${request.url}?${Date.now()}`;
              },
            },
          },
        ],
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Celo Wallet',
        short_name: 'CeloWallet',
        description: 'A Progressive Web App wallet for Celo blockchain transactions',
        theme_color: '#35d07f',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        categories: ['finance', 'productivity'],
      },
    }),
  ],
  base: './',
  define: {
    'process.env.ENABLE_GPT_5_1_CODEX_MAX': JSON.stringify(process.env.ENABLE_GPT_5_1_CODEX_MAX ?? 'false')
  }
});
