import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode
  const env = loadEnv(mode, process.cwd(), '')
  
  // Use the BASE_PATH environment variable if it exists, otherwise use '/web_player/'
  // This will be set in the GitHub Actions workflow
  const base = env.BASE_PATH || '/web_player/'
  
  return {
    base,
    plugins: [react()],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
    },
    server: {
      // Enable this if you're having HMR issues
      // host: '0.0.0.0',
      port: 3000,
      strictPort: true,
    },
  }
})
