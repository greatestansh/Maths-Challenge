import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: { codeSplitting: { groups: [{ name: 'katex', test: /[\\/]node_modules[\\/]katex[\\/].*\.mjs$/ }] } },
    },
  },
});
