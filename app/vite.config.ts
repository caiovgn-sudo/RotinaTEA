import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'RotinaTEA',
        short_name: 'RotinaTEA',
        description: 'Prancha de Rotina Visual Interativa, Temporizador Progressivo e Registro de Crises para Alunos com TEA',
        start_url: '/',
        display: 'standalone',
        background_color: '#F5F0E8',
        theme_color: '#8B6F47',
        orientation: 'portrait-primary',
        scope: '/',
        lang: 'pt-BR',
        icons: [
          {
            src: 'icons/icon-72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/icon-96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/icon-128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/icon-144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/icon-152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/icon-384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['education', 'medical', 'health'],
        shortcuts: [
          {
            name: 'Prancha Visual',
            short_name: 'Prancha',
            description: 'Acessar a prancha de rotina visual do aluno',
            url: '/?perfil=ALUNO',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'Registro de Crise',
            short_name: 'Crise',
            description: 'Registrar episódio de desregulação em 1 clique',
            url: '/?perfil=PROFESSOR',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }]
          }
        ],
        prefer_related_applications: false
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,woff2}'],
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 horas
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /^https:\/\/api\.arasaac\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'arasaac-pictograms',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 dias
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  base: '/',
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor';
          }
          if (id.includes('node_modules/@supabase')) {
            return 'supabase';
          }
        }
      }
    }
  }
});