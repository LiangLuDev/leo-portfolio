import { defineConfig } from 'vite';

export default defineConfig({
    base: '/leo-portfolio/',
    root: '.',
    publicDir: 'public',
    build: {
        outDir: 'dist',
    },
    server: {
        open: true,
    },
});
