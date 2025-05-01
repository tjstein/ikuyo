import 'dotenv/config';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';

const INSTANT_APP_ID = process.env.INSTANT_APP_ID;
const MAPTILER_API_KEY = process.env.MAPTILER_API_KEY;

if (!INSTANT_APP_ID) {
  throw new Error('process.env.INSTANT_APP_ID is not set');
}
if (!MAPTILER_API_KEY) {
  throw new Error('process.env.MAPTILER_API_KEY is not set');
}

export default defineConfig({
  html: {
    template: './index.html',
    appIcon: {
      name: 'Ikuyo',
      icons: [
        {
          src: './public/ikuyo-180.png',
          size: 180,
          target: 'apple-touch-icon',
        },
        {
          src: './public/ikuyo-192.png',
          size: 192,
          target: 'web-app-manifest',
        },
        {
          src: './public/ikuyo-512.png',
          size: 512,
          target: 'web-app-manifest',
        },
      ],
    },
  },
  server: {
    // For local dev, only localhost:5173 is allowed by the OAuth callback
    host: 'localhost',
    port: 5173,
  },
  source: {
    entry: {
      index: './src/main.tsx',
    },
    define: {
      'process.env.INSTANT_APP_ID': JSON.stringify(process.env.INSTANT_APP_ID),
      'process.env.MAPTILER_API_KEY': JSON.stringify(
        process.env.MAPTILER_API_KEY,
      ),
    },
  },
  output: {
    polyfill: 'usage',
  },
  plugins: [pluginReact(), pluginSass()],
});
