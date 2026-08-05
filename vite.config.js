import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/star-forge-idle/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['**/*'], // Ensures all assets are cached
      manifest: false, // Don't generate a manifest, we have one
      workbox: {
        cacheId: 'star-forge-idle',
        globPatterns: ['**/*.{js,css,html,json,svg,png,woff2}']
      }
    })
  ],
  build: {
    target: 'esnext',
    commonjsOptions: {
      include: [/break_infinity\.js$/, /node_modules/]
    }
  },
  optimizeDeps: {
    include: ['break_infinity.js']
  }
});
