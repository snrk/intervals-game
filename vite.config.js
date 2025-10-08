import restart from 'vite-plugin-restart'
import { defineConfig } from 'vite' 
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
    // base: '/intervals/',
    root: 'src/',
    publicDir: '../static/',
    server:
    {
        host: true,
        open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env)
    },
    build:
    {
        outDir: '../dist',
        emptyOutDir: true,
        sourcemap: true
    },
    plugins:
    [
        basicSsl(),
        restart({ restart: [ '../static/**', ] })
    ],
})