import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/pc-info-app/', // Tämä kertoo GitHub Pages -julkaisupolun
  plugins: [react()],
})
