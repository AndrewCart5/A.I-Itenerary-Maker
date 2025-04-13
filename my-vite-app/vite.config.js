import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Make sure we're exporting a configuration object
const config = defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
})

export default config