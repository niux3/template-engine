import { build } from 'esbuild'
import { readdir, stat } from 'fs/promises'
import { join } from 'path'

const distDir = './dist'

async function getAllJsFiles(dir) {
    const files = []
    const items = await readdir(dir)

    for (const item of items) {
        const fullPath = join(dir, item)
        const stats = await stat(fullPath)

        if (stats.isDirectory()) {
            files.push(...await getAllJsFiles(fullPath))
        } else if (item.endsWith('.js')) {
            files.push(fullPath)
        }
    }

    return files
}

async function minifyAll() {
    console.log('🔧 Minifying all JS files in dist/...')

    const files = await getAllJsFiles(distDir)

    for (const file of files) {
        console.log(`  → Minifying ${file}`)
        await build({
            entryPoints: [file],
            outfile: file,
            allowOverwrite: true,
            minify: true,
            format: 'esm',
            target: 'es2020'
        })
    }

    console.log('✅ Minification complete!')
}

minifyAll().catch(err => {
    console.error('❌ Minification failed:', err)
    process.exit(1)
})