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

    describe('Chainable helpers', () => {
        beforeEach(() => {
            engine
                .helper('upper', s => s.toUpperCase())
                .helper('lower', s => s.toLowerCase())
                .helper('trim', s => s.trim())
                .helper('reverse', s => s.split('').reverse().join(''))
                .helper('wrap', (s, tag) => `<${tag}>${s}</${tag}>`)
                .helper('truncate', (s, len) => s.length > len ? s.slice(0, len) + '...' : s)
                .helper('prefix', (s, pre) => pre + s)
                .helper('suffix', (s, suf) => s + suf)
        })

        it('should chain two helpers', () => {
            const result = engine.render('[[= helpers(name).upper().trim() ]]', {
                name: '  hello  '
            })

            expect(result).toBe('HELLO')
        })

        it('should chain three helpers', () => {
            const result = engine.render('[[= helpers(text).trim().upper().reverse() ]]', {
                text: '  hello  '
            })

            expect(result).toBe('OLLEH')
        })

        it('should chain with arguments', () => {
            const result = engine.render('[[= helpers(text).truncate(5).upper() ]]', {
                text: 'hello world'
            })

            expect(result).toBe('HELLO...')
        })

        it('should chain with multiple arguments', () => {
            const result = engine.render('[[-helpers(text).wrap("b").wrap("i") ]]', {
                text: 'hello'
            })

            expect(result).toBe('<i><b>hello</b></i>')
        })

        it('should chain prefix and suffix', () => {
            const result = engine.render('[[-helpers(word).prefix(">> ").suffix(" <<") ]]', {
                word: 'test'
            })

            expect(result).toBe('>> test <<')
        })

        it('should chain 5+ helpers', () => {
            const result = engine.render(
                '[[= helpers(text).trim().lower().reverse().truncate(8).upper() ]]',
                { text: '  HELLO WORLD  ' }
            )

            expect(result).toBe('DLROW OL...')
        })

        it('should work with raw output', () => {
            const result = engine.render('[[-helpers(text).wrap("strong").wrap("em") ]]', {
                text: 'bold'
            })

            expect(result).toBe('<em><strong>bold</strong></em>')
        })

        it('should chain inside loops', () => {
            const result = engine.render(`
        [[ items.forEach(item => { ]]
          [[= helpers(item).upper().reverse() ]],
        [[ }) ]]
      `, {
                items: ['ab', 'cd', 'ef']
            })

            expect(result).toContain('BA,')
            expect(result).toContain('DC,')
            expect(result).toContain('FE,')
        })

        it('should chain with variable data', () => {
            const result = engine.render('[[= helpers(user.name).trim().upper() ]]', {
                user: { name: '  alice  ' }
            })

            expect(result).toBe('ALICE')
        })

        it('should chain with computed values', () => {
            const result = engine.render('[[= helpers(a + b).upper() ]]', {
                a: 'hello',
                b: 'world'
            })

            expect(result).toBe('HELLOWORLD')
        })
    })

    describe('Chainable helpers - valueOf/toString coercion', () => {
        beforeEach(() => {
            engine.helper('double', n => n * 2)
            engine.helper('add', (n, x) => n + x)
        })

        it('should auto-convert to string in template output', () => {
            const result = engine.render('[[= helpers(5).double().add(3) ]]', {})
            expect(result).toBe('13')
        })

        it('should work with numeric operations', () => {
            const result = engine.render('[[= helpers(10).double() ]]', {})
            expect(result).toBe('20')
        })

        it('should coerce in string concatenation', () => {
            const result = engine.render('[[= "Result: " + helpers(5).double() ]]', {})
            expect(result).toBe('Result: 10')
        })

        it('should coerce in comparisons', () => {
            engine.helper('isEven', n => n % 2 === 0)
            const result = engine.render('[[= helpers(4).isEven() ? "yes" : "no" ]]', {})
            expect(result).toBe('yes')
        })
    })

    describe('Chainable helpers - Edge cases', () => {
        it('should handle single helper call as chain', () => {
            engine.helper('upper', s => s.toUpperCase())
            const result = engine.render('[[= helpers(name).upper() ]]', {
                name: 'alice'
            })

            expect(result).toBe('ALICE')
        })

        it('should handle empty string', () => {
            engine.helper('wrap', (s, tag) => `<${tag}>${s}</${tag}>`)
            const result = engine.render('[[-helpers("").wrap("p") ]]', {})

            expect(result).toBe('<p></p>')
        })

        it('should handle null/undefined gracefully', () => {
            engine.helper('safe', s => s ?? 'N/A')
            const result = engine.render('[[= helpers(value).safe() ]]', {
                value: null
            })

            expect(result).toBe('N/A')
        })

        it('should not interfere with non-chained helpers', () => {
            engine.helper('greet', name => `Hello ${name}`)

            // Non-chained usage should still work
            const result1 = engine.render('[[= helpers.greet(name) ]]', {
                name: 'Bob'
            })

            // Chained usage
            engine.helper('upper', s => s.toUpperCase())
            const result2 = engine.render('[[= helpers(name).upper() ]]', {
                name: 'alice'
            })

            expect(result1).toBe('Hello Bob')
            expect(result2).toBe('ALICE')
        })

        it('should handle helpers returning objects (non-chainable)', () => {
            engine.helper('getUser', name => ({ name, role: 'admin' }))

            const result = engine.render(`
        [[ const user = helpers.getUser(name) ]]
        [[= user.name ]]: [[= user.role ]]
      `, {
                name: 'Alice'
            })

            expect(result.trim()).toContain('Alice: admin')
        })

        it('should work with helper returning numbers', () => {
            engine.helper('times', (n, x) => n * x)
            engine.helper('add', (n, x) => n + x)

            const result = engine.render('[[= helpers(5).times(2).add(10) ]]', {})
            expect(result).toBe('20')
        })

        it('should handle helpers with no arguments in chain', () => {
            engine.helper('random', () => 42)
            engine.helper('double', n => n * 2)

            const result = engine.render('[[= helpers().random().double() ]]', {})
            expect(result).toBe('84')
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

        it('should capitalize with chaining', () => {
            engine.helper('capitalize', str =>
                str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
            )
            engine.helper('trim', s => s.trim())

            const result = engine.render('[[= helpers(word).trim().capitalize() ]]', {
                word: '  bonjour  '
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

        it('should truncate with chaining', () => {
            engine.helper('truncate', (str, len) =>
                str.length > len ? str.slice(0, len) + '...' : str
            )
            engine.helper('upper', s => s.toUpperCase())

            const result = engine.render('[[= helpers(text).truncate(5).upper() ]]', {
                text: 'hello world'
            })

            expect(result).toBe('HELLO...')
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

        it('should render product card with chained helpers', () => {
            engine
                .helper('multiply', (n, x) => n * x)
                .helper('round', (n, d) => parseFloat(n.toFixed(d)))
                .helper('currency', price => `€${price}`)

            const result = engine.render(`
        <div class="product">
          <h3>[[= name ]]</h3>
          <p>Prix: [[= helpers(price).multiply(0.8).round(2).currency() ]]</p>
        </div>
      `, {
                name: 'Cafetière',
                price: 99.99
            })

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

        it('should render with chained text transforms', () => {
            engine
                .helper('trim', s => s.trim())
                .helper('upper', s => s.toUpperCase())
                .helper('wrap', (s, tag) => `<${tag}>${s}</${tag}>`)

            const result = engine.render(`
        <div>[[-helpers(title).trim().upper().wrap("h1").wrap("header") ]]</div>
      `, {
                title: '  welcome  '
            })

            expect(result).toContain('<header><h1>WELCOME</h1></header>')
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

        it('should handle chaining with undefined helper', () => {
            engine.helper('upper', s => s.toUpperCase())

            // This should not throw but return undefined for nonexistent helper
            expect(() => {
                engine.render('[[= helpers(name).nonexistent() ]]', { name: 'test' })
            }).toThrow()
        })

        it('should handle mixed chained and non-chained usage', () => {
            engine
                .helper('upper', s => s.toUpperCase())
                .helper('prefix', (s, p) => p + s)

            const result = engine.render(`
        [[= helpers.upper(a) ]]
        [[= helpers(b).upper() ]]
        [[-helpers.prefix(c, ">> ") ]]
      `, {
                a: 'test1',
                b: 'test2',
                c: 'test3'
            })

            expect(result).toContain('TEST1')
            expect(result).toContain('TEST2')
            expect(result).toContain('>> test3')
        })
    })
})