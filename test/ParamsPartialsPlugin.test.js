import { describe, it, expect, beforeEach } from 'vitest'
import { TemplateEngine } from '../src/TemplateEngine.js'
import { PartialsPlugin } from '../src/plugins/partials.js'
import { ParamsPartialsPlugin } from '../src/plugins/partials_params.js'

describe('Params Partials Plugin', () => {
    let engine

    beforeEach(() => {
        engine = new TemplateEngine()
            .use(PartialsPlugin)
            .use(ParamsPartialsPlugin)
    })

    describe('Basic parameter passing', () => {
        it('should render partial with single parameter', () => {
            engine.partial('greeting', '<h1>[[= message ]]</h1>')

            const result = engine.render('[[> greeting message="Hello World" ]]', {})

            expect(result).toBe('<h1>Hello World</h1>')
        })

        it('should render partial with multiple parameters', () => {
            engine.partial('card', '<div class="[[= color ]]">[[= title ]]</div>')

            const result = engine.render('[[> card title="My Card" color="blue" ]]', {})

            expect(result).toBe('<div class="blue">My Card</div>')
        })

        it('should handle parameters with spaces in values', () => {
            engine.partial('text', '<p>[[= content ]]</p>')

            const result = engine.render('[[> text content="Hello World" ]]', {})

            expect(result).toBe('<p>Hello World</p>')
        })
    })

    describe('Parameter type conversion', () => {
        it('should parse boolean true', () => {
            engine.partial('check', '[[ if (active) { ]]Active[[ } else { ]]Inactive[[ } ]]')

            const result = engine.render('[[> check active="true" ]]', {})

            expect(result).toContain('Active')
        })

        it('should parse boolean false', () => {
            engine.partial('check', '[[ if (active) { ]]Active[[ } else { ]]Inactive[[ } ]]')

            const result = engine.render('[[> check active="false" ]]', {})

            expect(result).toContain('Inactive')
        })

        it('should parse numbers', () => {
            engine.partial('counter', '<span>[[= count ]]</span>')

            const result = engine.render('[[> counter count="42" ]]', {})

            expect(result).toBe('<span>42</span>')
        })

        it('should keep strings as strings', () => {
            engine.partial('label', '<label>[[= text ]]</label>')

            const result = engine.render('[[> label text="Name" ]]', {})

            expect(result).toBe('<label>Name</label>')
        })
    })

    describe('Parameter merging with context', () => {
        it('should merge parameters with existing data', () => {
            engine.partial('user', '<div>[[= name ]] - [[= role ]]</div>')

            const result = engine.render('[[> user role="Admin" ]]', {
                name: 'Alice'
            })

            expect(result).toBe('<div>Alice - Admin</div>')
        })

        it('should allow parameters to override context data', () => {
            engine.partial('message', '<p>[[= text ]]</p>')

            const result = engine.render('[[> message text="Override" ]]', {
                text: 'Original'
            })

            expect(result).toBe('<p>Override</p>')
        })

        it('should preserve context data not overridden by parameters', () => {
            engine.partial('profile', '<div>[[= name ]] [[= age ]] [[= city ]]</div>')

            const result = engine.render('[[> profile city="Paris" ]]', {
                name: 'Bob',
                age: 30
            })

            expect(result).toBe('<div>Bob 30 Paris</div>')
        })
    })

    describe('Multiple partials with parameters', () => {
        it('should handle multiple partials with different parameters', () => {
            engine.partial('badge', '<span class="[[= type ]]">[[= label ]]</span>')

            const template = `
        [[> badge type="success" label="OK" ]]
        [[> badge type="error" label="Failed" ]]
      `

            const result = engine.render(template, {})

            expect(result).toContain('class="success"')
            expect(result).toContain('OK')
            expect(result).toContain('class="error"')
            expect(result).toContain('Failed')
        })

        it('should handle same partial with different parameters', () => {
            engine.partial('button', '<button class="[[= size ]]">[[= text ]]</button>')

            const template = `
        [[> button size="small" text="Cancel" ]]
        [[> button size="large" text="Submit" ]]
      `

            const result = engine.render(template, {})

            expect(result).toContain('class="small"')
            expect(result).toContain('Cancel')
            expect(result).toContain('class="large"')
            expect(result).toContain('Submit')
        })
    })

    describe('Parameters with special characters', () => {
        it('should handle parameters with hyphens', () => {
            engine.partial('css', '<div class="[[= cssClass ]]"></div>')

            const result = engine.render('[[> css cssClass="bg-blue-500" ]]', {})

            expect(result).toBe('<div class="bg-blue-500"></div>')
        })

        it('should handle empty string parameters', () => {
            engine.partial('text', '<p>[[= content ]]</p>')

            const result = engine.render('[[> text content="" ]]', {})

            expect(result).toBe('<p></p>')
        })

        it('should handle numeric strings', () => {
            engine.partial('code', '<code>[[= id ]]</code>')

            const result = engine.render('[[> code id="123" ]]', {})

            expect(result).toBe('<code>123</code>')
        })
    })

    describe('Parameters in loops', () => {
        it('should work with parameters inside forEach', () => {
            engine.partial('item', '<li class="[[= type ]]">[[= label ]]</li>')

            const template = `
        <ul>
        [[ items.forEach(item => { ]]
          [[> item type="product" label="Product Item" ]]
        [[ }) ]]
        </ul>
      `

            const result = engine.render(template, {
                items: [
                    { name: 'Item 1' },
                    { name: 'Item 2' }
                ]
            })

            expect(result).toContain('class="product"')
            expect(result).toContain('Product Item')
        })
    })

    describe('Combining with static partials', () => {
        it('should allow mixing static and parameterized partials', () => {
            engine.partial('header', '<header>Header</header>')
            engine.partial('content', '<main>[[= text ]]</main>')

            const template = `
        [[> header ]]
        [[> content text="Main Content" ]]
      `

            const result = engine.render(template, {})

            expect(result).toContain('<header>Header</header>')
            expect(result).toContain('<main>Main Content</main>')
        })
    })

    describe('Error handling', () => {
        it('should throw error for non-existent partial', () => {
            expect(() => {
                engine.render('[[> nonexistent param="value" ]]', {})
            }).toThrow('Partial "nonexistent" not found')
        })
    })

    describe('Real-world use cases', () => {
        it('should create reusable button component', () => {
            engine.partial('button', `
        <button class="btn btn-[[= variant ]] btn-[[= size ]]" type="[[= type ]]">
          [[= label ]]
        </button>
      `)

            const result = engine.render(
                '[[> button variant="primary" size="large" type="submit" label="Save Changes" ]]',
                {}
            )

            expect(result).toContain('btn-primary')
            expect(result).toContain('btn-large')
            expect(result).toContain('type="submit"')
            expect(result).toContain('Save Changes')
        })

        it('should create card component with multiple parameters', () => {
            engine.partial('card', `
        <div class="card [[= theme ]]">
          <h3>[[= title ]]</h3>
          <p>[[= description ]]</p>
          [[ if (showButton) { ]]
            <button>[[= buttonText ]]</button>
          [[ } ]]
        </div>
      `)

            const result = engine.render(
                '[[> card theme="dark" title="Welcome" description="Hello World" showButton="true" buttonText="Click Me" ]]',
                {}
            )

            expect(result).toContain('card dark')
            expect(result).toContain('<h3>Welcome</h3>')
            expect(result).toContain('<p>Hello World</p>')
            expect(result).toContain('<button>Click Me</button>')
        })

        it('should create alert component with different variants', () => {
            engine.partial('alert', `
        <div class="alert alert-[[= type ]]" role="alert">
          [[= message ]]
        </div>
      `)

            const template = `
        [[> alert type="success" message="Operation successful!" ]]
        [[> alert type="warning" message="Please be careful" ]]
        [[> alert type="error" message="Something went wrong" ]]
      `

            const result = engine.render(template, {})

            expect(result).toContain('alert-success')
            expect(result).toContain('Operation successful!')
            expect(result).toContain('alert-warning')
            expect(result).toContain('Please be careful')
            expect(result).toContain('alert-error')
            expect(result).toContain('Something went wrong')
        })
    })

    describe('Cache behavior', () => {
        it('should work correctly with template cache', () => {
            engine.partial('test', '<div>[[= value ]]</div>')

            const template = '[[> test value="First" ]]'
            const result1 = engine.render(template, {})
            const result2 = engine.render(template, {})

            expect(result1).toBe('<div>First</div>')
            expect(result2).toBe('<div>First</div>')
        })

        it('should update when partial is changed', () => {
            engine.partial('dynamic', '<p>[[= text ]]</p>')

            const result1 = engine.render('[[> dynamic text="V1" ]]', {})

            engine.partial('dynamic', '<span>[[= text ]]</span>')
            engine.clear()

            const result2 = engine.render('[[> dynamic text="V2" ]]', {})

            expect(result1).toBe('<p>V1</p>')
            expect(result2).toBe('<span>V2</span>')
        })
    })
})