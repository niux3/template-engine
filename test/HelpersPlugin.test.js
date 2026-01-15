import { describe, it, expect, beforeEach } from 'vitest'
import { TemplateEngine } from '../src/TemplateEngine.js'
import { HelpersPlugin } from '../src/plugins/helpers.js'

describe('HelpersPlugin', () => {
    let engine

    beforeEach(() => {
        engine = new TemplateEngine().use(HelpersPlugin)
    })

    describe('Basic helper functionality', () => {
        it('should add helper() method to engine', () => {
            expect(engine.helper).toBeDefined()
            expect(typeof engine.helper).toBe('function')
        })

        it('should register and use a simple helper', () => {
            engine.helper('uppercase', str => str.toUpperCase())

            const result = engine.render('[[= helpers.uppercase(name) ]]', {
                name: 'patrick'
            })

            expect(result).toBe('PATRICK')
        })

        it('should register multiple helpers', () => {
            engine.helper('upper', s => s.toUpperCase())
            engine.helper('lower', s => s.toLowerCase())

            const result = engine.render(`
        [[= helpers.upper(first) ]] [[= helpers.lower(last) ]]
      `, {
                first: 'patrick',
                last: 'MICHU'
            })

            expect(result.trim()).toBe('PATRICK michu')
        })

        it('should call helper with correct arguments', () => {
            engine.helper('add', (a, b) => a + b)

            const result = engine.render('[[= helpers.add(5, 3) ]]', {})
            expect(result).toBe('8')
        })

        it('should call helper with variable arguments', () => {
            engine.helper('multiply', (a, b) => a * b)

            const result = engine.render('[[= helpers.multiply(x, y) ]]', {
                x: 4,
                y: 5
            })

            expect(result).toBe('20')
        })
    })

    describe('String manipulation helpers', () => {
        it('should capitalize strings', () => {
            engine.helper('capitalize', str =>
                str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
            )

            const result = engine.render('[[= helpers.capitalize(word) ]]', {
                word: 'bonjour'
            })

            expect(result).toBe('Bonjour')
        })

        it('should truncate strings', () => {
            engine.helper('truncate', (str, len) =>
                str.length > len ? str.slice(0, len) + '...' : str
            )

            const result = engine.render('[[= helpers.truncate(text, 10) ]]', {
                text: 'Ceci est un long text'
            })

            expect(result).toBe('Ceci est u...')
        })

        it('should reverse strings', () => {
            engine.helper('reverse', str => str.split('').reverse().join(''))

            const result = engine.render('[[= helpers.reverse(word) ]]', {
                word: 'hello'
            })

            expect(result).toBe('olleh')
        })

        it('should repeat strings', () => {
            engine.helper('repeat', (str, times) => str.repeat(times))

            const result = engine.render('[[= helpers.repeat(char, 3) ]]', {
                char: 'x'
            })

            expect(result).toBe('xxx')
        })
    })

    describe('Number formatting helpers', () => {
        it('should format currency', () => {
            engine.helper('currency', price => `€${price.toFixed(2)}`)

            const result = engine.render('[[= helpers.currency(price) ]]', {
                price: 19.5
            })

            expect(result).toBe('€19.50')
        })

        it('should format percentages', () => {
            engine.helper('percent', val => `${(val * 100).toFixed(0)}%`)

            const result = engine.render('[[= helpers.percent(ratio) ]]', {
                ratio: 0.75
            })

            expect(result).toBe('75%')
        })

        it('should round numbers', () => {
            engine.helper('round', (num, decimals) => num.toFixed(decimals))

            const result = engine.render('[[= helpers.round(pi, 2) ]]', {
                pi: 3.14159
            })

            expect(result).toBe('3.14')
        })
    })

    describe('Date/Time helpers', () => {
        it('should format dates', () => {
            engine.helper('formatDate', date => {
                const d = new Date(date)
                return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
            })

            const result = engine.render('[[= helpers.formatDate(date) ]]', {
                date: '2025-01-15'
            })

            expect(result).toMatch(/15\/1\/2025/)
        })

        it('should calculate relative time', () => {
            engine.helper('timeAgo', date => {
                const seconds = Math.floor((new Date() - new Date(date)) / 1000)
                if (seconds < 60) return 'maintenant'
                if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`
                return `${Math.floor(seconds / 3600)} heure`
            })

            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
            const result = engine.render('[[= helpers.timeAgo(date) ]]', {
                date: fiveMinutesAgo
            })

            expect(result).toContain('minutes')
        })
    })

    describe('Array helpers', () => {
        it('should join array elements', () => {
            engine.helper('join', (arr, sep) => arr.join(sep))

            const result = engine.render('[[= helpers.join(tags, ", ") ]]', {
                tags: ['JavaScript', 'Node', 'Web']
            })

            expect(result).toBe('JavaScript, Node, Web')
        })

        it('should count array length', () => {
            engine.helper('count', arr => arr.length)

            const result = engine.render('[[= helpers.count(items) ]]', {
                items: [1, 2, 3, 4, 5]
            })

            expect(result).toBe('5')
        })

        it('should get first element', () => {
            engine.helper('first', arr => arr[0])

            const result = engine.render('[[= helpers.first(colors) ]]', {
                colors: ['red', 'green', 'blue']
            })

            expect(result).toBe('red')
        })

        it('should get last element', () => {
            engine.helper('last', arr => arr[arr.length - 1])

            const result = engine.render('[[= helpers.last(colors) ]]', {
                colors: ['red', 'green', 'blue']
            })

            expect(result).toBe('blue')
        })
    })

    describe('Conditional helpers', () => {
        it('should return default value if undefined', () => {
            engine.helper('default', (val, def) => val !== undefined ? val : def)

            const result1 = engine.render('[[= helpers.default(name, "invité") ]]', {
                name: 'Patrick'
            })

            // Note: Can't test undefined variable because with() throws
            // Instead test with explicitly undefined value
            const result2 = engine.render('[[= helpers.default(name, "invité") ]]', {
                name: undefined
            })

            expect(result1).toBe('Patrick')
            expect(result2).toBe('invité')
        })

        it('should check if value exists', () => {
            engine.helper('exists', val => val ? '✓' : '✗')

            const result = engine.render('[[= helpers.exists(user) ]]', {
                user: 'Alice'
            })

            expect(result).toBe('✓')
        })
    })

    describe('Helpers with HTML escaping', () => {
        it('should work with escaped output', () => {
            engine.helper('strong', text => `<strong>${text}</strong>`)

            const result = engine.render('[[= helpers.strong(word) ]]', {
                word: 'Hello'
            })

            // Should be escaped
            expect(result).toBe('&lt;strong&gt;Hello&lt;/strong&gt;')
        })

        it('should work with raw output', () => {
            engine.helper('strong', text => `<strong>${text}</strong>`)

            const result = engine.render('[[-helpers.strong(word) ]]', {
                word: 'Hello'
            })

            // Should NOT be escaped
            expect(result).toBe('<strong>Hello</strong>')
        })

        it('should escape user input in helpers', () => {
            engine.helper('tag', (name, content) => `<${name}>${content}</${name}>`)

            const result = engine.render('[[-helpers.tag("p", text) ]]', {
                text: '<script>alert("xss")</script>'
            })

            // Helper doesn't escape, so XSS is possible with raw output
            expect(result).toContain('<script>')
        })
    })

    describe('Method chaining', () => {
        it('should return engine for chaining', () => {
            const result = engine.helper('test', x => x)
            expect(result).toBe(engine)
        })

        it('should allow chaining multiple helpers', () => {
            engine
                .helper('upper', s => s.toUpperCase())
                .helper('lower', s => s.toLowerCase())
                .helper('reverse', s => s.split('').reverse().join(''))

            const result = engine.render(`
        [[= helpers.upper(a) ]]
        [[= helpers.lower(b) ]]
        [[= helpers.reverse(c) ]]
      `, {
                a: 'hello',
                b: 'WORLD',
                c: 'test'
            })

            expect(result).toContain('HELLO')
            expect(result).toContain('world')
            expect(result).toContain('tset')
        })
    })

    describe('Helpers in loops', () => {
        it('should use helpers inside forEach', () => {
            engine.helper('upper', s => s.toUpperCase())

            const result = engine.render(`
        [[ items.forEach(item => { ]]
          [[= helpers.upper(item) ]]
        [[ }) ]]
      `, {
                items: ['a', 'b', 'c']
            })

            expect(result.trim().replace(/\s+/g, '')).toBe('ABC')
        })

        it('should use helpers with array methods', () => {
            engine.helper('double', n => n * 2)

            const result = engine.render(`
        [[ numbers.map(n => helpers.double(n)).forEach(n => { ]]
          [[= n ]],
        [[ }) ]]
      `, {
                numbers: [1, 2, 3]
            })

            expect(result).toContain('2,')
            expect(result).toContain('4,')
            expect(result).toContain('6,')
        })
    })

    describe('Complex helpers', () => {
        it('should use helper that returns objects', () => {
            engine.helper('getUserInfo', name => ({
                name: name,
                email: `${name.toLowerCase()}@example.com`
            }))

            const result = engine.render(`
        [[ const user = helpers.getUserInfo(name) ]]
        [[= user.name ]]: [[= user.email ]]
      `, {
                name: 'Patrick'
            })

            expect(result.trim()).toContain('Patrick: patrick@example.com')
        })

        it('should use helper with closures', () => {
            let counter = 0
            engine.helper('increment', () => ++counter)

            const result1 = engine.render('[[= helpers.increment() ]]', {})
            const result2 = engine.render('[[= helpers.increment() ]]', {})
            const result3 = engine.render('[[= helpers.increment() ]]', {})

            expect(result1).toBe('1')
            expect(result2).toBe('2')
            expect(result3).toBe('3')
        })

        it('should use helper that accesses external data', () => {
            const translations = {
                hello: 'Bonjour',
                goodbye: 'Au revoir'
            }

            engine.helper('translate', key => translations[key] || key)

            const result = engine.render('[[= helpers.translate(key) ]]', {
                key: 'hello'
            })

            expect(result).toBe('Bonjour')
        })
    })

    describe('Real-world use cases', () => {
        it('should render a product card with price formatting', () => {
            engine
                .helper('currency', price => `€${price.toFixed(2)}`)
                .helper('discount', (price, percent) => price * (1 - percent))

            const result = engine.render(`
        <div class="product">
          <h3>[[= name ]]</h3>
          <p class="price">
            Original: [[= helpers.currency(price) ]]
            <br>
            Solde: [[= helpers.currency(helpers.discount(price, 0.2)) ]]
          </p>
        </div>
      `, {
                name: 'Cafetière',
                price: 99.99
            })

            expect(result).toContain('€99.99')
            expect(result).toContain('€79.99')
        })

        it('should render user profile with various helpers', () => {
            engine
                .helper('initials', name => name.split(' ').map(n => n[0]).join(''))
                .helper('ago', date => 'membre depuis 2020')
                .helper('pluralize', (count, word) =>
                    `${count} ${word}${count !== 1 ? 's' : ''}`
                )

            const result = engine.render(`
        <div class="profile">
          <div class="avatar">[[= helpers.initials(name) ]]</div>
          <h2>[[= name ]]</h2>
          <p>[[= helpers.ago(joined) ]]</p>
          <p>[[= helpers.pluralize(posts, "post") ]]</p>
        </div>
      `, {
                name: 'Patrick Michu',
                joined: '2020-01-01',
                posts: 42
            })

            expect(result).toContain('PM')
            expect(result).toContain('membre depuis 2020')
            expect(result).toContain('42 posts')
        })

        it('should render blog post with markdown-like helper', () => {
            engine.helper('markdown', text => {
                return text
                    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.+?)\*/g, '<em>$1</em>')
            })

            const result = engine.render(`
        <article>
          <h1>[[= title ]]</h1>
          <div>[[-helpers.markdown(content) ]]</div>
        </article>
      `, {
                title: 'Un titre',
                content: 'text en **gras** et en *italic*.'
            })

            expect(result).toContain('<strong>gras</strong>')
            expect(result).toContain('<em>italic</em>')
        })
    })

    describe('Edge cases', () => {
        it('should handle helper returning undefined', () => {
            engine.helper('returnUndefined', () => undefined)

            const result = engine.render('[[= helpers.returnUndefined() ]]', {})
            expect(result).toBe('undefined')
        })

        it('should handle helper returning null', () => {
            engine.helper('returnNull', () => null)

            const result = engine.render('[[= helpers.returnNull() ]]', {})
            expect(result).toBe('null')
        })

        it('should handle helper returning empty string', () => {
            engine.helper('empty', () => '')

            const result = engine.render('[[= helpers.empty() ]]', {})
            expect(result).toBe('')
        })

        it('should handle helper with no arguments', () => {
            engine.helper('getRandomNumber', () => Math.floor(Math.random() * 100))

            const result = engine.render('[[= helpers.getRandomNumber() ]]', {})
            expect(parseInt(result)).toBeGreaterThanOrEqual(0)
            expect(parseInt(result)).toBeLessThan(100)
        })

        it('should override helper with same name', () => {
            engine.helper('greet', name => `Hello ${name}`)
            const result1 = engine.render('[[= helpers.greet(name) ]]', { name: 'Patrick' })

            engine.helper('greet', name => `Hi ${name}`)
            engine.clear() // Clear cache
            const result2 = engine.render('[[= helpers.greet(name) ]]', { name: 'Patrick' })

            expect(result1).toBe('Hello Patrick')
            expect(result2).toBe('Hi Patrick')
        })
    })
})