import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Khóa GEMINI_API_KEY chỉ được đọc ở phần máy chủ (server/), không bao giờ đi qua cấu hình Vite.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 900,
  },
});
