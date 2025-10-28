import path from 'path'
import { defineConfig } from 'vitest/config'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

const react = (() => {
    try {
        const plugin = require('@vitejs/plugin-react')
        return plugin.default ?? plugin
    } catch {
        return () => ({ name: 'noop-react-plugin' })
    }
})()

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/__tests__/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'src/__tests__/',
                '**/*.d.ts',
                '**/*.config.*',
                '**/mockData',
                '**/*.type.ts',
            ],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@/modules': path.resolve(__dirname, './src/modules'),
            '@/shared': path.resolve(__dirname, './src/shared'),
        },
    },
})
