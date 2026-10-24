import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // the Go backend embeds this directory into its binary (backend/cmd/main.go)
    outDir: '../backend/cmd/frontend/browser',
    emptyOutDir: true,
  },
});
