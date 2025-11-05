import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import compression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    // Compression 임시 비활성화 (테스트용)
    // mode === "production" && compression({
    //   algorithm: 'gzip',
    //   ext: '.gz',
    //   threshold: 10240, // Only compress files larger than 10kb
    //   deleteOriginFile: false,
    // }),
    // mode === "production" && compression({
    //   algorithm: 'brotliCompress',
    //   ext: '.br',
    //   threshold: 10240,
    //   deleteOriginFile: false,
    // })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Keep React in the main vendor bundle - DO NOT split it
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            // React Router with React
            if (id.includes('react-router')) {
              return 'vendor';
            }
            // Supabase in separate chunk
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            // All other dependencies
            return 'libs';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'esbuild',
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
    ],
  },
}));
