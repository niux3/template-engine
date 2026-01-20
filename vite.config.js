import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    build: {
        lib: {
            entry: {
                'template-engine': resolve(__dirname, 'src/TemplateEngine.js'),
                'plugins/index': resolve(__dirname, 'src/plugins/index.js'),
                'plugins/partials': resolve(__dirname, 'src/plugins/partials.js'),
                'plugins/partials_dynamic': resolve(__dirname, 'src/plugins/partials_dynamic.js'),
                'plugins/partials_params': resolve(__dirname, 'src/plugins/partials_params.js'),
                'plugins/helpers': resolve(__dirname, 'src/plugins/helpers.js'),
                'plugins/strict': resolve(__dirname, 'src/plugins/strict.js'),
                'plugins/i18n': resolve(__dirname, 'src/plugins/i18n.js'),
                'plugins/async': resolve(__dirname, 'src/plugins/async.js')
            },
            formats: ['es'], // ES module uniquement pour support multiple entry points
        },
        rollupOptions: {
            output: {
                // Préserver la structure des plugins
                entryFileNames: '[name].js',
                // Exports nommés pour meilleure compatibilité
                exports: 'named'
            }
        },
        // Minification activée explicitement
        minify: 'esbuild',
        // S'assurer qu'on est en mode production
        sourcemap: false,
        emptyOutDir: true
    },
    test: {
        globals: true,
        environment: 'node',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            exclude: ['node_modules/', 'test/', 'demo/']
        }
    }
})