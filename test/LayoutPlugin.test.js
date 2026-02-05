import { describe, it, expect, beforeEach } from 'vitest'
import { TemplateEngine } from '../src/TemplateEngine.js'
import { LayoutPlugin } from '../src/plugins/layout.js'

describe('LayoutPlugin', () => {
    let engine

    beforeEach(() => {
        engine = new TemplateEngine().use(LayoutPlugin)
    })

    describe('Plugin initialization', () => {
        it('should add layout() method to engine', () => {
            expect(engine.layout).toBeDefined()
            expect(typeof engine.layout).toBe('function')
        })

        it('should register a layout', () => {
            const result = engine.layout('base', '<html>[[block:content]][[/block]]</html>')
            expect(result).toBe(engine)
        })
    })

    describe('Basic layout inheritance', () => {
        it('should extend a simple layout', () => {
            engine.layout('base', '<html>[[block:content]]Default[[/block]]</html>')

            const result = engine.render(`
                [[extends:base]]
                [[block:content]]Hello World[[/block]]
            `, {})

            expect(result).toContain('<html>')
            expect(result).toContain('Hello World')
            expect(result).not.toContain('Default')
        })

        it('should use default block content when not overridden', () => {
            engine.layout('base', '<html>[[block:content]]Default Content[[/block]]</html>')

            const result = engine.render('[[extends:base]]', {})

            expect(result).toContain('Default Content')
        })

        it('should handle multiple blocks', () => {
            engine.layout('base', `
                <html>
                    <head>[[block:head]]<title>Default</title>[[/block]]</head>
                    <body>[[block:body]]Default Body[[/block]]</body>
                </html>
            `)

            const result = engine.render(`
                [[extends:base]]
                [[block:head]]<title>Custom</title>[[/block]]
                [[block:body]]Custom Body[[/block]]
            `, {})

            expect(result).toContain('<title>Custom</title>')
            expect(result).toContain('Custom Body')
            expect(result).not.toContain('Default')
        })

        it('should override some blocks and keep others default', () => {
            engine.layout('base', `
                <div>
                    [[block:header]]Default Header[[/block]]
                    [[block:content]]Default Content[[/block]]
                    [[block:footer]]Default Footer[[/block]]
                </div>
            `)

            const result = engine.render(`
                [[extends:base]]
                [[block:content]]Custom Content[[/block]]
            `, {})

            expect(result).toContain('Default Header')
            expect(result).toContain('Custom Content')
            expect(result).toContain('Default Footer')
        })
    })

    describe('Parent block inclusion', () => {
        it('should include parent content with [[parent]]', () => {
            engine.layout('base', `
                [[block:head]]
                    <meta charset="utf-8">
                [[/block]]
            `)

            const result = engine.render(`
                [[extends:base]]
                [[block:head]]
                    [[parent]]
                    <meta name="viewport" content="width=device-width">
                [[/block]]
            `, {})

            expect(result).toContain('<meta charset="utf-8">')
            expect(result).toContain('<meta name="viewport"')
        })

        it('should replace [[parent]] with parent block content', () => {
            engine.layout('base', '[[block:content]]Parent Content[[/block]]')

            const result = engine.render(`
                [[extends:base]]
                [[block:content]]Before [[parent]] After[[/block]]
            `, {})

            expect(result).toBe('Before Parent Content After')
        })

        it('should handle multiple [[parent]] in same block', () => {
            engine.layout('base', '[[block:content]]X[[/block]]')

            const result = engine.render(`
                [[extends:base]]
                [[block:content]][[parent]]-[[parent]][[/block]]
            `, {})

            expect(result).toBe('X-X')
        })

        it('should work without [[parent]] directive', () => {
            engine.layout('base', '[[block:content]]Old[[/block]]')

            const result = engine.render(`
                [[extends:base]]
                [[block:content]]New[[/block]]
            `, {})

            expect(result).toBe('New')
            expect(result).not.toContain('Old')
        })
    })

    describe('Multi-level inheritance', () => {
        it('should support two-level inheritance', () => {
            engine.layout('base', '<div>[[block:content]]Base[[/block]]</div>')
            engine.layout('page', `
                [[extends:base]]
                [[block:content]]Page[[/block]]
            `)

            const result = engine.render('[[extends:page]]', {})

            expect(result).toContain('Page')
            expect(result).not.toContain('Base')
        })

        it('should support three-level inheritance', () => {
            engine.layout('base', '[[block:content]]L1[[/block]]')
            engine.layout('middle', `
                [[extends:base]]
                [[block:content]]L2[[/block]]
            `)
            engine.layout('final', `
                [[extends:middle]]
                [[block:content]]L3[[/block]]
            `)

            const result = engine.render('[[extends:final]]', {})

            expect(result).toBe('L3')
        })

        it('should resolve parent blocks through inheritance chain', () => {
            engine.layout('base', '[[block:styles]]<style>base</style>[[/block]]')
            engine.layout('layout', `
                [[extends:base]]
                [[block:styles]]
                    [[parent]]
                    <style>layout</style>
                [[/block]]
            `)

            const result = engine.render(`
                [[extends:layout]]
                [[block:styles]]
                    [[parent]]
                    <style>page</style>
                [[/block]]
            `, {})

            expect(result).toContain('base')
            expect(result).toContain('layout')
            expect(result).toContain('page')
        })
    })

    describe('Block with variables', () => {
        it('should render variables inside blocks', () => {
            engine.layout('base', '[[block:content]][[= title ]][[/block]]')

            const result = engine.render(`
                [[extends:base]]
                [[block:content]][[= title ]][[/block]]
            `, { title: 'Hello' })

            expect(result).toBe('Hello')
        })

        it('should access data in overridden blocks', () => {
            engine.layout('base', '<h1>[[block:title]]Default[[/block]]</h1>')

            const result = engine.render(`
                [[extends:base]]
                [[block:title]][[= pageTitle ]][[/block]]
            `, { pageTitle: 'My Page' })

            expect(result).toContain('My Page')
        })

        it('should use conditionals in blocks', () => {
            engine.layout('base', '[[block:content]][[ if(show) { ]]Visible[[ } ]][[/block]]')

            const result1 = engine.render('[[extends:base]]', { show: true })
            const result2 = engine.render('[[extends:base]]', { show: false })

            expect(result1).toContain('Visible')
            expect(result2).not.toContain('Visible')
        })

        it('should use loops in blocks', () => {
            engine.layout('base', `
                [[block:items]]
                    [[ items.forEach(item => { ]][[= item ]][[ }) ]]
                [[/block]]
            `)

            const result = engine.render('[[extends:base]]', {
                items: ['A', 'B', 'C']
            })

            expect(result.trim().replace(/\s+/g, '')).toBe('ABC')
        })
    })

    describe('Error handling', () => {
        it('should throw error for missing layout', () => {
            expect(() => {
                engine.render('[[extends:nonexistent]]', {})
            }).toThrow('Layout "nonexistent" not found')
        })

        it('should throw error with correct layout name', () => {
            engine.layout('base', 'content')

            expect(() => {
                engine.render('[[extends:missing]]', {})
            }).toThrow('Layout "missing" not found')
        })

        it('should prevent infinite inheritance loops', () => {
            engine.layout('a', '[[extends:b]]')
            engine.layout('b', '[[extends:a]]')

            expect(() => {
                engine.render('[[extends:a]]', {})
            }).toThrow('Layout inheritance too deep')
        })

        it('should limit inheritance depth to 10 levels', () => {
            // Create 12 levels of inheritance
            for (let i = 0; i < 12; i++) {
                const next = i < 11 ? `[[extends:l${i + 1}]]` : 'End'
                engine.layout(`l${i}`, next)
            }

            expect(() => {
                engine.render('[[extends:l0]]', {})
            }).toThrow('Layout inheritance too deep')
        })
    })

    describe('Method chaining', () => {
        it('should return engine for chaining', () => {
            const result = engine.layout('test', 'content')
            expect(result).toBe(engine)
        })

        it('should allow chaining multiple layouts', () => {
            engine
                .layout('base', '<html>[[block:content]][[/block]]</html>')
                .layout('page', '[[extends:base]][[block:content]]Page[[/block]]')
                .layout('article', '[[extends:page]]')

            const result = engine.render('[[extends:article]]', {})

            expect(result).toContain('<html>')
            expect(result).toContain('Page')
        })
    })

    describe('Cache behavior', () => {
        it('should clear block cache when layouts change', () => {
            engine.layout('base', '[[block:content]]V1[[/block]]')

            const result1 = engine.render('[[extends:base]]', {})
            expect(result1).toBe('V1')

            // Update layout
            engine.layout('base', '[[block:content]]V2[[/block]]')
            engine.clear()

            const result2 = engine.render('[[extends:base]]', {})
            expect(result2).toBe('V2')
        })
    })

    describe('Edge cases', () => {
        it('should handle empty blocks', () => {
            engine.layout('base', '[[block:content]][[/block]]')

            const result = engine.render(`
                [[extends:base]]
                [[block:content]][[/block]]
            `, {})

            expect(result).toBe('')
        })

        it('should handle blocks with whitespace', () => {
            engine.layout('base', '[[block:content]]   [[/block]]')

            const result = engine.render('[[extends:base]]', {})

            expect(result.trim()).toBe('')
        })

        it('should handle block names with underscores', () => {
            engine.layout('base', '[[block:main_content]]Default[[/block]]')

            const result = engine.render(`
                [[extends:base]]
                [[block:main_content]]Custom[[/block]]
            `, {})

            expect(result).toBe('Custom')
        })

        it('should handle block names with numbers', () => {
            engine.layout('base', '[[block:section1]]Default[[/block]]')

            const result = engine.render(`
                [[extends:base]]
                [[block:section1]]Custom[[/block]]
            `, {})

            expect(result).toBe('Custom')
        })

        it('should not interfere with templates without extends', () => {
            engine.layout('base', '[[block:content]]Layout[[/block]]')

            const result = engine.render('Simple [[= text ]]', { text: 'template' })

            expect(result).toBe('Simple template')
        })

        it('should handle nested HTML in blocks', () => {
            engine.layout('base', `
                [[block:content]]
                    <div class="default">
                        <p>Default</p>
                    </div>
                [[/block]]
            `)

            const result = engine.render(`
                [[extends:base]]
                [[block:content]]
                    <div class="custom">
                        <p>Custom</p>
                    </div>
                [[/block]]
            `, {})

            expect(result).toContain('class="custom"')
            expect(result).toContain('<p>Custom</p>')
            expect(result).not.toContain('Default')
        })
    })

    describe('Real-world use cases', () => {
        it('should render a complete HTML page layout', () => {
            engine.layout('base', `
                <!DOCTYPE html>
                <html>
                <head>
                    [[block:head]]
                        <meta charset="UTF-8">
                        <title>Default Title</title>
                    [[/block]]
                </head>
                <body>
                    [[block:header]]
                        <header><h1>Default Header</h1></header>
                    [[/block]]
                    [[block:content]]
                        <main>Default Content</main>
                    [[/block]]
                    [[block:footer]]
                        <footer>&copy; 2025</footer>
                    [[/block]]
                </body>
                </html>
            `)

            const result = engine.render(`
                [[extends:base]]
                [[block:head]]
                    [[parent]]
                    <meta name="description" content="Page description">
                [[/block]]
                [[block:content]]
                    <main>
                        <h1>[[= title ]]</h1>
                        <p>[[= content ]]</p>
                    </main>
                [[/block]]
            `, {
                title: 'Welcome',
                content: 'Hello World'
            })

            expect(result).toContain('<!DOCTYPE html>')
            expect(result).toContain('<meta charset="UTF-8">')
            expect(result).toContain('Page description')
            expect(result).toContain('<h1>Default Header</h1>')
            expect(result).toContain('<h1>Welcome</h1>')
            expect(result).toContain('<p>Hello World</p>')
            expect(result).toContain('&copy; 2025')
        })

        it('should create a three-tier layout system', () => {
            // Base layout
            engine.layout('base', `
                <html>
                    <head>[[block:styles]]<link rel="base.css">[[/block]]</head>
                    <body>[[block:content]][[/block]]</body>
                </html>
            `)

            // Admin layout extends base
            engine.layout('admin', `
                [[extends:base]]
                [[block:styles]]
                    [[parent]]
                    <link rel="admin.css">
                [[/block]]
                [[block:content]]
                    <nav>Admin Nav</nav>
                    [[block:main]][[/block]]
                [[/block]]
            `)

            // Admin page extends admin
            const result = engine.render(`
                [[extends:admin]]
                [[block:styles]]
                    [[parent]]
                    <link rel="dashboard.css">
                [[/block]]
                [[block:main]]
                    <h1>Dashboard</h1>
                [[/block]]
            `, {})

            expect(result).toContain('base.css')
            expect(result).toContain('admin.css')
            expect(result).toContain('dashboard.css')
            expect(result).toContain('Admin Nav')
            expect(result).toContain('<h1>Dashboard</h1>')
        })

        it('should render blog layout with sidebar', () => {
            engine.layout('blog', `
                <div class="container">
                    <aside>
                        [[block:sidebar]]
                            <h3>Categories</h3>
                            <ul><li>Default</li></ul>
                        [[/block]]
                    </aside>
                    <main>
                        [[block:content]]
                            No posts yet
                        [[/block]]
                    </main>
                </div>
            `)

            const result = engine.render(`
                [[extends:blog]]
                [[block:sidebar]]
                    [[parent]]
                    <h3>Recent Posts</h3>
                [[/block]]
                [[block:content]]
                    <article>
                        <h1>[[= post.title ]]</h1>
                        <p>[[= post.body ]]</p>
                    </article>
                [[/block]]
            `, {
                post: {
                    title: 'My First Post',
                    body: 'Hello blogging world!'
                }
            })

            expect(result).toContain('<h3>Categories</h3>')
            expect(result).toContain('<h3>Recent Posts</h3>')
            expect(result).toContain('My First Post')
            expect(result).toContain('Hello blogging world!')
        })

        it('should render email template with layout', () => {
            engine.layout('email', `
                <table width="600">
                    <tr>
                        <td>
                            [[block:header]]
                                <h1>Newsletter</h1>
                            [[/block]]
                        </td>
                    </tr>
                    <tr>
                        <td>
                            [[block:body]]
                                Default message
                            [[/block]]
                        </td>
                    </tr>
                    <tr>
                        <td>
                            [[block:footer]]
                                <p>Unsubscribe</p>
                            [[/block]]
                        </td>
                    </tr>
                </table>
            `)

            const result = engine.render(`
                [[extends:email]]
                [[block:body]]
                    <p>Bonjour [[= name ]],</p>
                    <p>[[= message ]]</p>
                [[/block]]
            `, {
                name: 'Alice',
                message: 'Check out our new products!'
            })

            expect(result).toContain('<h1>Newsletter</h1>')
            expect(result).toContain('Bonjour Alice,')
            expect(result).toContain('Check out our new products!')
            expect(result).toContain('Unsubscribe')
        })

        it('should render dashboard with conditional blocks', () => {
            engine.layout('dashboard', `
                <div class="dashboard">
                    [[block:alerts]]
                        [[ if (hasAlerts) { ]]
                            <div class="alert">You have alerts</div>
                        [[ } ]]
                    [[/block]]
                    [[block:stats]]
                        <div class="stats">Stats</div>
                    [[/block]]
                    [[block:content]][[/block]]
                </div>
            `)

            const result = engine.render(`
                [[extends:dashboard]]
                [[block:content]]
                    [[ users.forEach(user => { ]]
                        <div>[[= user.name ]]</div>
                    [[ }) ]]
                [[/block]]
            `, {
                hasAlerts: true,
                users: [
                    { name: 'Alice' },
                    { name: 'Bob' }
                ]
            })

            expect(result).toContain('You have alerts')
            expect(result).toContain('<div class="stats">Stats</div>')
            expect(result).toContain('<div>Alice</div>')
            expect(result).toContain('<div>Bob</div>')
        })
    })

    describe('Integration with other features', () => {
        it('should work with HTML escaping', () => {
            engine.layout('base', '[[block:content]][[= text ]][[/block]]')

            const result = engine.render(`
                [[extends:base]]
                [[block:content]][[= text ]][[/block]]
            `, { text: '<script>alert("xss")</script>' })

            expect(result).toContain('&lt;script&gt;')
            expect(result).not.toContain('<script>')
        })

        it('should work with raw output', () => {
            engine.layout('base', '[[block:html]][[-content ]][[/block]]')

            const result = engine.render('[[extends:base]]', {
                content: '<strong>Bold</strong>'
            })

            expect(result).toBe('<strong>Bold</strong>')
        })

        it('should handle complex JavaScript expressions', () => {
            engine.layout('base', `
                [[block:content]]
                    [[ const doubled = items.map(x => x * 2) ]]
                    [[ doubled.forEach(n => { ]][[= n ]][[ }) ]]
                [[/block]]
            `)

            const result = engine.render('[[extends:base]]', {
                items: [1, 2, 3]
            })

            expect(result.trim().replace(/\s+/g, '')).toBe('246')
        })
    })

    describe('Block name variations', () => {
        it('should handle camelCase block names', () => {
            engine.layout('base', '[[block:mainContent]]Default[[/block]]')

            const result = engine.render(`
                [[extends:base]]
                [[block:mainContent]]Custom[[/block]]
            `, {})

            expect(result).toBe('Custom')
        })

        it('should handle single letter block names', () => {
            engine.layout('base', '[[block:a]]Default[[/block]]')

            const result = engine.render(`
                [[extends:base]]
                [[block:a]]Custom[[/block]]
            `, {})

            expect(result).toBe('Custom')
        })
    })

    describe('Layout updates', () => {
        it('should reflect layout changes after clearing cache', () => {
            engine.layout('base', '[[block:content]]V1[[/block]]')

            const template = '[[extends:base]]'
            const result1 = engine.render(template, {})

            engine.layout('base', '[[block:content]]V2[[/block]]')
            engine.clear()

            const result2 = engine.render(template, {})

            expect(result1).toBe('V1')
            expect(result2).toBe('V2')
        })

        it('should handle updating nested layouts', () => {
            engine.layout('base', '[[block:content]]Base V1[[/block]]')
            engine.layout('page', '[[extends:base]]')

            const result1 = engine.render('[[extends:page]]', {})

            engine.layout('base', '[[block:content]]Base V2[[/block]]')
            engine.clear()

            const result2 = engine.render('[[extends:page]]', {})

            expect(result1).toBe('Base V1')
            expect(result2).toBe('Base V2')
        })
    })

    describe('Performance considerations', () => {
        it('should handle large number of blocks efficiently', () => {
            let layoutTemplate = ''
            let childTemplate = '[[extends:large]]'

            for (let i = 0; i < 50; i++) {
                layoutTemplate += `[[block:b${i}]]Default${i}[[/block]]`
                if (i % 2 === 0) {
                    childTemplate += `[[block:b${i}]]Custom${i}[[/block]]`
                }
            }

            engine.layout('large', layoutTemplate)

            const result = engine.render(childTemplate, {})

            expect(result).toContain('Custom0')
            expect(result).toContain('Default1')
            expect(result).toContain('Custom2')
        })
    })
})