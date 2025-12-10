export default defineNuxtConfig({
  devtools: { enabled: true },
  
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:3001/api',
        changeOrigin: true,
        prependPath: true
      }
    }
  }
})