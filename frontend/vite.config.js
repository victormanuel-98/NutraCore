import { defineConfig } from "vite";

export default defineConfig({
  plugins: [],
  esbuild: {
    jsx: "automatic"
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'react-vendor';
          }

          if (id.includes('@radix-ui')) {
            return 'radix-vendor';
          }

          if (id.includes('lucide-react')) {
            return 'icons-vendor';
          }
        }
      }
    }
  }
});
