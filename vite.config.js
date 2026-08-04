import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
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
  ]
});
