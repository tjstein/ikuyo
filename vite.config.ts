import 'dotenv/config';
import { defineConfig } from 'vitest/config'; 
import preact from '@preact/preset-vite';

import { VitePWA } from 'vite-plugin-pwa';

const INSTANT_APP_ID = process.env.INSTANT_APP_ID;

if (!INSTANT_APP_ID) {
  throw new Error('process.env.INSTANT_APP_ID is not set');
}

// https://vitejs.dev/config/
export default defineConfig({
  // https://github.com/vitejs/vite/issues/18164#issuecomment-2365310242
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },

  define: {
    'process.env.INSTANT_APP_ID': JSON.stringify(INSTANT_APP_ID),
  },

  plugins: [
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Ikuyo',
        short_name: 'Ikuyo',
        description: 'Itinerary planning app',
        theme_color: '#AB4ABA',
        icons: [
          {
            src: './ikuyo-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: './ikuyo-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      strategies: 'generateSW',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallbackDenylist: [/^\/sw.js/],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('luxon')) {
              return 'v-luxon';
            }
            // TODO: generating this chunk may cause loading order issue, thus crashing the app
            // if (id.includes('@radix-ui')) {
            //   return 'v-radix-ui';
            // }
            if (id.includes('@instantdb')) {
              return 'v-instantdb';
            }
            if (id.includes('react')) {
              return 'v-react';
            }
            return 'v-vendor';
          }
        },
      },
    },
  },
  test: {
    watch: !process.env.CI,
  },
});
