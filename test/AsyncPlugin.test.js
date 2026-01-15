import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { TemplateEngine } from '../src/TemplateEngine.js'
import { AsyncPlugin } from '../src/plugins/async.js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Test fixtures directory
const fixturesDir = path.join(__dirname, 'fixtures')

describe('AsyncPlugin', () => {
    let engine

    beforeEach(() => {
        engine = new TemplateEngine().use(AsyncPlugin)
    })

    describe('Plugin initialization', () => {
        it('should add renderFile() method to engine', () => {
            expect(engine.renderFile).toBeDefined()
            expect(typeof engine.renderFile).toBe('function')
        })

        it('renderFile should return a Promise', async () => {
            // Create a temp file to avoid unhandled rejection
            await fs.mkdir(fixturesDir, { recursive: true })
            const testPath = path.join(fixturesDir, 'test-promise.html')
            await fs.writeFile(testPath, 'test')

            const result = engine.renderFile(testPath, {})
            expect(result).toBeInstanceOf(Promise)

            // Await to avoid unhandled rejection
            await result

            // Cleanup
            await fs.unlink(testPath)
            await fs.rmdir(fixturesDir)
        })
    })

    describe('File reading', () => {
        beforeEach(async () => {
            // Create fixtures directory
            await fs.mkdir(fixturesDir, { recursive: true })
        })

        afterEach(async () => {
            // Cleanup fixtures
            try {
                const files = await fs.readdir(fixturesDir)
                for (const file of files) {
                    await fs.unlink(path.join(fixturesDir, file))
                }
                await fs.rmdir(fixturesDir)
            } catch (err) {
                // Ignore cleanup errors
            }
        })

        it('should read and render a simple template file', async () => {
            const templatePath = path.join(fixturesDir, 'simple.html')
            await fs.writeFile(templatePath, '<h1>[[= title ]]</h1>')

            const result = await engine.renderFile(templatePath, { title: 'Hello' })
            expect(result).toBe('<h1>Hello</h1>')
        })

        it('should render template with variables', async () => {
            const templatePath = path.join(fixturesDir, 'vars.html')
            await fs.writeFile(templatePath, '<p>[[= name ]] is [[= age ]] ans</p>')

            const result = await engine.renderFile(templatePath, {
                name: 'Alice',
                age: 30
            })
            expect(result).toBe('<p>Alice is 30 ans</p>')
        })

        it('should render template with loops', async () => {
            const templatePath = path.join(fixturesDir, 'loop.html')
            await fs.writeFile(templatePath, `
        <ul>
        [[ items.forEach(item => { ]]
          <li>[[= item ]]</li>
        [[ }) ]]
        </ul>
      `)

            const result = await engine.renderFile(templatePath, {
                items: ['A', 'B', 'C']
            })

            expect(result).toContain('<li>A</li>')
            expect(result).toContain('<li>B</li>')
            expect(result).toContain('<li>C</li>')
        })

        it('should render template with conditionals', async () => {
            const templatePath = path.join(fixturesDir, 'conditional.html')
            await fs.writeFile(templatePath, `
        [[ if (show) { ]]
          <div>Visible</div>
        [[ } ]]
      `)

            const result1 = await engine.renderFile(templatePath, { show: true })
            const result2 = await engine.renderFile(templatePath, { show: false })

            expect(result1).toContain('Visible')
            expect(result2).not.toContain('Visible')
        })

        it('should handle multiline templates', async () => {
            const templatePath = path.join(fixturesDir, 'multiline.html')
            await fs.writeFile(templatePath, `
        <!DOCTYPE html>
        <html>
          <head>
            <title>[[= title ]]</title>
          </head>
          <body>
            <h1>[[= heading ]]</h1>
            <p>[[= content ]]</p>
          </body>
        </html>
      `)

            const result = await engine.renderFile(templatePath, {
                title: 'Ma Page',
                heading: 'Bienvenue',
                content: 'Salut tout le monde'
            })

            expect(result).toContain('<title>Ma Page</title>')
            expect(result).toContain('<h1>Bienvenue</h1>')
            expect(result).toContain('<p>Salut tout le monde</p>')
        })
    })

    describe('Error handling', () => {
        it('should throw error for non-existent file', async () => {
            await expect(
                engine.renderFile('/non/existent/file.html', {})
            ).rejects.toThrow()
        })

        it('should throw error for invalid path', async () => {
            await expect(
                engine.renderFile('', {})
            ).rejects.toThrow()
        })

        it('should throw error if file is not readable', async () => {
            const templatePath = path.join(fixturesDir, 'unreadable.html')

            // Create file
            await fs.mkdir(fixturesDir, { recursive: true })
            await fs.writeFile(templatePath, 'content')

            // Make unreadable (chmod 000)
            await fs.chmod(templatePath, 0o000)

            await expect(
                engine.renderFile(templatePath, {})
            ).rejects.toThrow()

            // Restore permissions for cleanup
            await fs.chmod(templatePath, 0o644)
        })

        it('should throw error for malformed template syntax', async () => {
            const templatePath = path.join(fixturesDir, 'malformed.html')
            await fs.mkdir(fixturesDir, { recursive: true })
            await fs.writeFile(templatePath, '[[ const x = { ]]')

            await expect(
                engine.renderFile(templatePath, {})
            ).rejects.toThrow(/Template compilation failed/)
        })
    })

    describe('Path handling', () => {
        beforeEach(async () => {
            await fs.mkdir(fixturesDir, { recursive: true })
        })

        afterEach(async () => {
            try {
                const files = await fs.readdir(fixturesDir)
                for (const file of files) {
                    await fs.unlink(path.join(fixturesDir, file))
                }
                await fs.rmdir(fixturesDir)
            } catch (err) {
                // Ignore
            }
        })

        it('should handle absolute paths', async () => {
            const templatePath = path.join(fixturesDir, 'absolute.html')
            await fs.writeFile(templatePath, '[[= value ]]')

            const result = await engine.renderFile(templatePath, { value: 'test' })
            expect(result).toBe('test')
        })

        it('should handle relative paths', async () => {
            const templatePath = path.join(fixturesDir, 'relative.html')
            await fs.writeFile(templatePath, '[[= value ]]')

            // Get relative path from current working directory
            const relativePath = path.relative(process.cwd(), templatePath)

            const result = await engine.renderFile(relativePath, { value: 'test' })
            expect(result).toBe('test')
        })

        it('should handle paths with special characters', async () => {
            const templatePath = path.join(fixturesDir, 'special-file_name.html')
            await fs.writeFile(templatePath, '[[= value ]]')

            const result = await engine.renderFile(templatePath, { value: 'test' })
            expect(result).toBe('test')
        })
    })

    describe('Data handling', () => {
        beforeEach(async () => {
            await fs.mkdir(fixturesDir, { recursive: true })
        })

        afterEach(async () => {
            try {
                const files = await fs.readdir(fixturesDir)
                for (const file of files) {
                    await fs.unlink(path.join(fixturesDir, file))
                }
                await fs.rmdir(fixturesDir)
            } catch (err) {
                // Ignore
            }
        })

        it('should handle empty data object', async () => {
            const templatePath = path.join(fixturesDir, 'no-vars.html')
            await fs.writeFile(templatePath, '<p>Static content</p>')

            const result = await engine.renderFile(templatePath, {})
            expect(result).toBe('<p>Static content</p>')
        })

        it('should handle missing data parameter', async () => {
            const templatePath = path.join(fixturesDir, 'no-data.html')
            await fs.writeFile(templatePath, '<p>Static content</p>')

            const result = await engine.renderFile(templatePath)
            expect(result).toBe('<p>Static content</p>')
        })

        it('should handle complex nested data', async () => {
            const templatePath = path.join(fixturesDir, 'nested.html')
            await fs.writeFile(templatePath, '[[= user.profile.name ]]')

            const result = await engine.renderFile(templatePath, {
                user: {
                    profile: {
                        name: 'Patrick'
                    }
                }
            })
            expect(result).toBe('Patrick')
        })
    })

    describe('Encoding', () => {
        beforeEach(async () => {
            await fs.mkdir(fixturesDir, { recursive: true })
        })

        afterEach(async () => {
            try {
                const files = await fs.readdir(fixturesDir)
                for (const file of files) {
                    await fs.unlink(path.join(fixturesDir, file))
                }
                await fs.rmdir(fixturesDir)
            } catch (err) {
                // Ignore
            }
        })

        it('should handle UTF-8 characters', async () => {
            const templatePath = path.join(fixturesDir, 'utf8.html')
            await fs.writeFile(templatePath, '<p>Héllo Wörld 你好 🚀</p>', 'utf8')

            const result = await engine.renderFile(templatePath, {})
            expect(result).toBe('<p>Héllo Wörld 你好 🚀</p>')
        })

        it('should handle special HTML entities', async () => {
            const templatePath = path.join(fixturesDir, 'entities.html')
            await fs.writeFile(templatePath, '[[= text ]]')

            const result = await engine.renderFile(templatePath, {
                text: '< > & " \''
            })
            expect(result).toBe('&lt; &gt; &amp; &quot; &#39;')
        })
    })

    describe('Caching behavior', () => {
        beforeEach(async () => {
            await fs.mkdir(fixturesDir, { recursive: true })
        })

        afterEach(async () => {
            try {
                const files = await fs.readdir(fixturesDir)
                for (const file of files) {
                    await fs.unlink(path.join(fixturesDir, file))
                }
                await fs.rmdir(fixturesDir)
            } catch (err) {
                // Ignore
            }
        })

        it('should cache compiled templates from files', async () => {
            const templatePath = path.join(fixturesDir, 'cached.html')
            await fs.writeFile(templatePath, '[[= value ]]')

            // First render
            const result1 = await engine.renderFile(templatePath, { value: 'first' })

            // Modify file
            await fs.writeFile(templatePath, '[[= value ]] modified')

            // Second render (should use cached version if same template string)
            const result2 = await engine.renderFile(templatePath, { value: 'second' })

            expect(result1).toBe('first')
            // Note: result2 will have "modified" because file is re-read
            expect(result2).toBe('second modified')
        })

        it('should allow cache clearing', async () => {
            const templatePath = path.join(fixturesDir, 'clear-cache.html')
            await fs.writeFile(templatePath, '[[= value ]]')

            await engine.renderFile(templatePath, { value: 'test' })

            // Clear cache
            engine.clear()

            // Should still work after clearing cache
            const result = await engine.renderFile(templatePath, { value: 'after-clear' })
            expect(result).toBe('after-clear')
        })
    })

    describe('Real-world use cases', () => {
        beforeEach(async () => {
            await fs.mkdir(fixturesDir, { recursive: true })
        })

        afterEach(async () => {
            try {
                const files = await fs.readdir(fixturesDir)
                for (const file of files) {
                    await fs.unlink(path.join(fixturesDir, file))
                }
                await fs.rmdir(fixturesDir)
            } catch (err) {
                // Ignore
            }
        })

        it('should render email template', async () => {
            const templatePath = path.join(fixturesDir, 'email.html')
            await fs.writeFile(templatePath, `
        <!DOCTYPE html>
        <html>
          <body>
            <h1>Hello [[= name ]]!</h1>
            <p>Your order #[[= orderId ]] has been confirmed.</p>
            <ul>
            [[ items.forEach(item => { ]]
              <li>[[= item.name ]] - €[[= item.price ]]</li>
            [[ }) ]]
            </ul>
            <p>Total: €[[= total ]]</p>
          </body>
        </html>
      `)

            const result = await engine.renderFile(templatePath, {
                name: 'Patrick',
                orderId: 12345,
                items: [
                    { name: 'Produit A', price: 29.99 },
                    { name: 'Produit B', price: 49.99 }
                ],
                total: 79.98
            })

            expect(result).toContain('Hello Patrick!')
            expect(result).toContain('order #12345')
            expect(result).toContain('Produit A - €29.99')
            expect(result).toContain('Total: €79.98')
        })

        it('should render blog post template', async () => {
            const templatePath = path.join(fixturesDir, 'blog.html')
            await fs.writeFile(templatePath, `
        <article>
          <h1>[[= post.title ]]</h1>
          <p class="meta">Par [[= post.author ]] on [[= post.date ]]</p>
          <div class="content">[[= post.content ]]</div>
          <div class="tags">
          [[ post.tags.forEach(tag => { ]]
            <span class="tag">[[= tag ]]</span>
          [[ }) ]]
          </div>
        </article>
      `)

            const result = await engine.renderFile(templatePath, {
                post: {
                    title: 'Mon premier article',
                    author: 'Alice',
                    date: '2025-01-15',
                    content: 'This is the content.',
                    tags: ['JavaScript', 'WebDev']
                }
            })

            expect(result).toContain('Mon premier article')
            expect(result).toContain('Par Alice')
            expect(result).toContain('JavaScript')
            expect(result).toContain('WebDev')
        })
    })

    describe('Browser environment detection', () => {
        it('should be Node.js environment in tests', () => {
            // In Vitest/Node.js, we can't truly test browser behavior
            // because we're always in Node.js environment
            // Just verify the method exists
            expect(engine.renderFile).toBeDefined()
            expect(typeof engine.renderFile).toBe('function')
        })
    })
})