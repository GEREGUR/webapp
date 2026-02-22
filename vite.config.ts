import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@/app': resolve(__dirname, './src/app'),
      '@/pages': resolve(__dirname, './src/pages'),
      '@/widgets': resolve(__dirname, './src/widgets'),
      '@/features': resolve(__dirname, './src/features'),
      '@/entities': resolve(__dirname, './src/entities'),
      '@/shared': resolve(__dirname, './src/shared'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
      },
    },
  },
  plugins: [
    svgr({
      svgrOptions: {
        svgoConfig: {
          plugins: [{ name: 'removeAttrs', params: { attrs: 'stroke' } }],
        },
      },
    }),
    react(),
    tsconfigPaths(),
    tailwindcss(),
    process.env.HTTPS && mkcert(),
  ].filter(Boolean),
  build: {
    target: 'esnext',
    minify: 'terser',
  },
  publicDir: './public',

  //TODO: remove in production
  server: {
    host: true,
    allowedHosts: true,
  },
});
