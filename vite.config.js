import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// On GitHub Actions, GITHUB_REPOSITORY is "owner/repo", so the Pages project
// site is served from "/repo/". Locally there is no prefix.
const repo = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : '';
const base = repo ? `/${repo}/` : '/';

export default defineConfig({
  base,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        history: resolve(__dirname, 'history.html'),
        leadership: resolve(__dirname, 'leadership.html'),
        events: resolve(__dirname, 'events.html'),
        contact: resolve(__dirname, 'contact.html'),
      },
    },
  },
  server: {
    port: 5173,
  },
});
