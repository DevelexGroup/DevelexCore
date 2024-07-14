import { defineConfig } from 'vite';
import { resolve } from 'path'
import dtsPlugin from 'vite-plugin-dts';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig(({ command, mode }) => {
  if (command === 'build' && mode === 'lib') {
    return {
      resolve: {
      alias: {
        $lib: resolve(__dirname, 'src/lib'),
      },
    },
    build: {
      lib: {
        entry: resolve(__dirname, 'src/lib/index.ts'),
        name: 'develex-core', // Replace with your library name
      formats: ['es', 'umd'],
      },
      rollupOptions: {},
    },
    plugins: [
      dtsPlugin({
        include: ['src/lib'],
        insertTypesEntry: true,
      }),
    ],};
  }
    // Default configuration (for building a page)
    return {
      plugins: [sveltekit()],
      test: {
        include: ['src/**/*.{test,spec}.{js,ts}'],
      },
    };
});
