import { defineConfig } from 'vite'
import { resolve } from 'path'


export default defineConfig(({ command, mode }) => {
    const isBuild = command === 'build';
    const isTest = mode === 'test' || process.env.VITEST;

    // évite toute ambiguïté
    const projectRoot = resolve(__dirname);
    const srcDir = resolve(projectRoot, 'src');

    return {
        // --- CONFIGURATION POUR LA DÉMO (DEV) ---
        // On ne définit le root que si on n'est pas en train de build la lib
        root: isBuild || isTest ? projectRoot : resolve(projectRoot, 'demo'),

        server: {
            fs: {
                // Autorise l'accès au dossier src qui est au-dessus de 'demo'
                allow: [projectRoot]
            }
        },

        resolve: {
            alias: {
                // Permet d'écrire import { ... } from '@/TemplateEngine' dans main.js
                '@': srcDir
            }
        },

        // --- CONFIGURATION BUILD (npm) ---
        build: {
            lib: {
                entry: {
                    'template-engine': resolve(srcDir, 'TemplateEngine.js'),
                    'plugins/index': resolve(srcDir, 'plugins/index.js'),
                    'plugins/partials': resolve(srcDir, 'plugins/partials.js'),
                    'plugins/layout': resolve(srcDir, 'plugins/layout.js'),
                    'plugins/experiments/partials_core': resolve(srcDir, 'plugins/experiments/partials_core.js'),
                    'plugins/experiments/partials_dynamic': resolve(srcDir, 'plugins/experiments/partials_dynamic.js'),
                    'plugins/experiments/partials_params': resolve(srcDir, 'plugins/experiments/partials_params.js'),
                    'plugins/helpers': resolve(srcDir, 'plugins/helpers.js'),
                    'plugins/strict': resolve(srcDir, 'plugins/strict.js'),
                    'plugins/i18n': resolve(srcDir, 'plugins/i18n.js'),
                    'plugins/async': resolve(srcDir, 'plugins/async.js')
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
            outDir: resolve(projectRoot, 'dist'),
            // Minification activée explicitement
            minify: 'esbuild',
            // S'assurer qu'on est en mode production
            sourcemap: false,
            emptyOutDir: true
        },
        test: {
            root: '.',
            globals: true,
            environment: 'node',
            include: ['test/**/*.{test,spec}.js', '**/*.{test,spec}.js'],
            coverage: {
                provider: 'v8',
                reporter: ['text', 'html'],
                exclude: ['node_modules/', 'test/', 'demo/']
            }
        }
    }
});