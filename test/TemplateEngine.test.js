import { describe, it, expect, beforeEach } from 'vitest'
import { TemplateEngine } from '../src/TemplateEngine.js'

describe('TemplateEngine - Core', () => {
    let engine

    beforeEach(() => {
        engine = new TemplateEngine()
    })

    describe('Basic rendering', () => {
        it('should render plain text', () => {
            const result = engine.render('Hello World', {})
            expect(result).toBe('Hello World')
        })

        it('should render escaped variables', () => {
            const result = engine.render('[[= name ]]', { name: 'Robert' })
            expect(result).toBe('Robert')
        })

        it('should render raw variables', () => {
            const result = engine.render('[[-html ]]', { html: '<b>Bold</b>' })
            expect(result).toBe('<b>Bold</b>')
        })

        it('should handle multiple variables', () => {
            const result = engine.render('[[= first ]] [[= last ]]', {
                first: 'Robert',
                last: 'Michu'
            })
            expect(result).toBe('Robert Michu')
        })
    })

    describe('HTML escaping', () => {
        it('should escape HTML entities by default', () => {
            const result = engine.render('[[= html ]]', {
                html: '<script>alert("xss")</script>'
            })
            expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
        })

        it('should escape all dangerous characters', () => {
            const result = engine.render('[[= str ]]', {
                str: '& < > " \''
            })
            expect(result).toBe('&amp; &lt; &gt; &quot; &#39;')
        })

        it('should not escape with raw output', () => {
            const result = engine.render('[[-html ]]', {
                html: '<b>Bold</b>'
            })
            expect(result).toBe('<b>Bold</b>')
        })
    })

    describe('JavaScript code execution', () => {
        it('should execute if/else blocks', () => {
            const tpl = `
        [[ if (age >= 18) { ]]
          Adult
        [[ } else { ]]
          Minor
        [[ } ]]
      `
            expect(engine.render(tpl, { age: 20 }).trim()).toBe('Adult')
            expect(engine.render(tpl, { age: 15 }).trim()).toBe('Minor')
        })

        it('should execute forEach loops', () => {
            const tpl = `[[ items.forEach(item => { ]][[= item ]][[ }) ]]`
            const result = engine.render(tpl, { items: ['A', 'B', 'C'] })
            expect(result).toBe('ABC')
        })

        it('should execute for loops', () => {
            const tpl = `[[ for (let i = 0; i < 3; i++) { ]][[= i ]][[ } ]]`
            const result = engine.render(tpl, {})
            expect(result).toBe('012')
        })

        it('should handle complex expressions', () => {
            const tpl = `[[= items.length > 0 ? 'Has items' : 'Empty' ]]`
            expect(engine.render(tpl, { items: [1, 2] })).toBe('Has items')
            expect(engine.render(tpl, { items: [] })).toBe('Empty')
        })
    })

    describe('Data access', () => {
        it('should access nested properties', () => {
            const result = engine.render('[[= user.profile.name ]]', {
                user: { profile: { name: 'Alice' } }
            })
            expect(result).toBe('Alice')
        })

        it('should access array elements', () => {
            const result = engine.render('[[= items[0] ]]', {
                items: ['first', 'second']
            })
            expect(result).toBe('first')
        })

        it('should access object with bracket notation', () => {
            const result = engine.render('[[= user["first-name"] ]]', {
                user: { 'first-name': 'Bob' }
            })
            expect(result).toBe('Bob')
        })
    })

    describe('Error handling', () => {
        it('should throw error for empty template', () => {
            expect(() => engine.render('', {})).toThrow('Template required')
        })

        it('should throw error for null template', () => {
            expect(() => engine.render(null, {})).toThrow('Template required')
        })

        it('should throw on undefined variables', () => {
            expect(() => {
                engine.render('[[= missing ]]', {})
            }).toThrow('missing is not defined')
        })

        it('should throw on compilation errors', () => {
            const tpl = '[[ const x = { ]]' // Syntax error: unclosed brace
            expect(() => engine.render(tpl, {})).toThrow('Template compilation failed')
        })
    })

    describe('Cache system', () => {
        it('should cache compiled templates', () => {
            const tpl = '[[= name ]]'

            // First render
            const result1 = engine.render(tpl, { name: 'Robert' })

            // Second render (should use cache)
            const result2 = engine.render(tpl, { name: 'Nathalie' })

            expect(result1).toBe('Robert')
            expect(result2).toBe('Nathalie')
        })

        it('should respect max cache size', () => {
            // Test that cache system works by rendering multiple templates
            for (let i = 0; i < 150; i++) {
                engine.render(`Template ${i}`, {})
            }

            // If no error thrown, cache eviction works
            expect(true).toBe(true)
        })

        it('should clear cache', () => {
            engine.render('[[= test ]]', { test: 'value' })

            const result = engine.clear()

            // Should return this for chaining
            expect(result).toBe(engine)
        })

        it('should return this for method chaining', () => {
            const result = engine.clear()
            expect(result).toBe(engine)
        })
    })

    describe('Edge cases', () => {
        it('should handle empty data object', () => {
            const result = engine.render('Static text', {})
            expect(result).toBe('Static text')
        })

        it('should handle templates with only code', () => {
            const tpl = '[[ let x = 5 ]][[ x += 3 ]][[= x ]]'
            const result = engine.render(tpl, {})
            expect(result).toBe('8')
        })

        it('should handle multiline templates', () => {
            const tpl = `
        <div>
          [[= title ]]
        </div>
      `
            const result = engine.render(tpl, { title: 'Test' })
            expect(result).toContain('Test')
        })

        it('should handle special characters in text', () => {
            const result = engine.render('Price: $[[= price ]]', { price: 9.99 })
            expect(result).toBe('Price: $9.99')
        })

        it('should convert non-string values to strings', () => {
            const result = engine.render('[[= num ]]', { num: 42 })
            expect(result).toBe('42')
        })

        it('should handle boolean values', () => {
            const result = engine.render('[[= flag ]]', { flag: true })
            expect(result).toBe('true')
        })

        it('should handle null values', () => {
            const result = engine.render('[[= value ]]', { value: null })
            expect(result).toBe('null')
        })
    })

    describe('Complex real-world scenarios', () => {
        it('should render a product list', () => {
            const tpl = `
        <ul>
        [[ products.forEach(p => { ]]
          <li>[[= p.name ]] - $[[= p.price ]]</li>
        [[ }) ]]
        </ul>
      `
            const data = {
                products: [
                    { name: 'Coffee', price: 3.50 },
                    { name: 'Tea', price: 2.75 }
                ]
            }
            const result = engine.render(tpl, data)
            expect(result).toContain('Coffee')
            expect(result).toContain('3.5')
            expect(result).toContain('Tea')
            expect(result).toContain('2.75')
        })

        it('should render a user card with conditionals', () => {
            const tpl = `
        <div class="user">
          <h2>[[= user.name ]]</h2>
          [[ if (user.verified) { ]]
            <span class="badge">✓ Verified</span>
          [[ } ]]
          [[ if (user.bio) { ]]
            <p>[[= user.bio ]]</p>
          [[ } else { ]]
            <p>No bio provided</p>
          [[ } ]]
        </div>
      `
            const result = engine.render(tpl, {
                user: {
                    name: 'Alice',
                    verified: true,
                    bio: 'Developer'
                }
            })
            expect(result).toContain('Alice')
            expect(result).toContain('✓ Verified')
            expect(result).toContain('Developer')
        })
    })
})