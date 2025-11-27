// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api/serp': {
                target: 'https://serpapi.com',
                changeOrigin: true,
                rewrite: function (path) { return path.replace(/^\/api\/serp/, ''); },
                secure: true
            }
        }
    }
});
