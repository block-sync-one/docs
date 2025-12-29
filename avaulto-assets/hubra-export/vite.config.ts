import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { VitePWA } from "vite-plugin-pwa";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  define: {
    "process.env": {},
  },
  resolve: {
    alias: {
      "buffer": "buffer",
      // Add these aliases to resolve buffer-layout conflicts
      "buffer-layout": "@solana/buffer-layout",
      "@solana/buffer-layout": "@solana/buffer-layout",
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
    VitePWA({
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}"],
        // Force immediate updates
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // Network first for HTML to ensure fresh content
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        // Network first for all requests
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
              },
            },
          },
          {
            urlPattern: /\.(?:html)$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "html-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 0, // Always check network first for HTML
              },
            },
          },
          {
            // Cache images with CacheFirst strategy for offline support
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 100, // Cache up to 100 images
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache external image CDNs (e.g., token icons from external APIs)
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "external-images-cache",
              expiration: {
                maxEntries: 200, // Cache more external images
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days for external images
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      registerType: "autoUpdate",
      // Check for updates more frequently
      devOptions: {
        enabled: false,
        type: "module",
      },
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "android-chrome-192x192.png"],
      injectRegister: "auto",
      manifest: {
        name: "Hubra - Your Solana App",
        short_name: "Hubra",
        description: "Hubra - The power of CEX, The freedom of DeFi",
        start_url: "/",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#FEAA01",
        orientation: "portrait-primary",
        scope: "/",
        lang: "en",
        categories: ["finance", "productivity"],
        icons: [
          {
            src: "images/app-icons/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable any",
          },
          {
            src: "images/app-icons/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable any",
          },
          {
            src: "images/app-icons/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
          },
          {
            src: "images/app-icons/favicon-32x32.png",
            sizes: "32x32",
            type: "image/png",
          },
          {
            src: "images/app-icons/favicon-16x16.png",
            sizes: "16x16",
            type: "image/png",
          },
        ],
      },
    }),
    nodePolyfills({
      protocolImports: true,
      globals: {
        Buffer: true,
        process: true,
      },
    }),
  ],
});
