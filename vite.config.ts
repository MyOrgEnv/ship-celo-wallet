import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    'process.env.ENABLE_GPT_5_1_CODEX_MAX': JSON.stringify(process.env.ENABLE_GPT_5_1_CODEX_MAX ?? 'false'),
  }
});
