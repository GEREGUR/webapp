import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@/app": resolve(__dirname, "./src/app"),
      "@/pages": resolve(__dirname, "./src/pages"),
      "@/widgets": resolve(__dirname, "./src/widgets"),
      "@/features": resolve(__dirname, "./src/features"),
      "@/entities": resolve(__dirname, "./src/entities"),
      "@/shared": resolve(__dirname, "./src/shared"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern",
      },
    },
  },
  plugins: [react(), tsconfigPaths(), tailwindcss(), process.env.HTTPS && mkcert()],
  build: {
    target: "esnext",
    minify: "terser",
  },
  publicDir: "./public",
  server: {
    host: true,
    allowedHosts: true,
  },
});
