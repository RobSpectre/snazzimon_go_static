import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Replace 'snazzimon-go' with your GitHub repository name
  base: '/snazzimon-go/',
})
