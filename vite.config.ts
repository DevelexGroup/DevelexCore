import { defineConfig } from 'vite';
import { resolve } from 'path'
import dtsPlugin from 'vite-plugin-dts';
import { sveltekit } from '@sveltejs/kit/vite';
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ command, mode }) => {
  if (command === 'build' && mode === 'lib') {
    return {
      base: './',
      resolve: {
        alias: {
          $lib: resolve(__dirname, 'src/lib'),
        },
      },
      build: {
        lib: {
          entry: resolve(__dirname, 'src/lib/index.ts'),
          name: 'develex-core',
          formats: ['es', 'umd'],
        },
        rollupOptions: {
          moduleContext: {
            [resolve(__dirname, 'src/lib/GazeInput/GazeInputBridge.ts')]: 'window',
          },
        },
      },
      plugins: [
        dtsPlugin({
          include: ['src/lib'],
          insertTypesEntry: true,
        }),
      ],
    };
  }

  // Default configuration (for building a page)
  return {
    plugins: [
      sveltekit(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Develex Core',
          short_name: 'Develex',
          description: 'Eye tracking integration and gaze-based interactions for web applications',
          theme_color: '#007bff',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            {
              src: 'favicon.png',
              sizes: '500x500',
              type: 'image/png'
            }
          ],
          categories: ['productivity', 'utilities'],
          orientation: 'any'
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,txt}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/gitlab\.ics\.muni\.cz\/api\/v4\/projects\/7015\/packages\/npm\//,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 10,
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        },
        devOptions: {
          enabled: true
        }
      })
    ],
    test: {
      include: ['src/**/*.{test,spec}.{js,ts}']
    }
  };
});
