import { defineConfig, configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: [], // Add setup file if needed
        exclude: [...configDefaults.exclude, 'hf-space-worker/**', 'src/tests/phase1.test.js'],
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
})
