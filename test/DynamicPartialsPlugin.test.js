import { describe, it, expect, beforeEach } from 'vitest'
import { TemplateEngine } from '../src/TemplateEngine.js'
import { PartialsPlugin } from '../src/plugins/partials.js'
import { withDynamic } from '../src/plugins/partials_dynamic.js'

describe('Dynamic Partials Decorator', () => {
    let engine

    beforeEach(() => {
        engine = new TemplateEngine()
            .use(withDynamic(PartialsPlugin))
    })

    describe('Basic dynamic partial rendering', () => {
        it('should render dynamic partial using variable', () => {
            engine.partial('adminHeader', '<h1>Admin Panel</h1>')
            engine.partial('userHeader', '<h1>User Dashboard</h1>')

            const result = engine.render('[[> (headerType) ]]', {
                headerType: 'adminHeader'
            })

            expect(result).toBe('<h1>Admin Panel</h1>')
        })

        it('should render different partials based on variable value', () => {
            engine.partial('light', '<div class="theme-light">Light Theme</div>')
            engine.partial('dark', '<div class="theme-dark">Dark Theme</div>')

            const result1 = engine.render('[[> (theme) ]]', { theme: 'light' })
            const result2 = engine.render('[[> (theme) ]]', { theme: 'dark' })

            expect(result1).toContain('Light Theme')
            expect(result2).toContain('Dark Theme')
        })

        it('should handle whitespace in dynamic partial syntax', () => {
            engine.partial('content', '<p>Content</p>')

            const result = engine.render('[[>  (  contentType  )  ]]', {
                contentType: 'content'
            })

            expect(result).toBe('<p>Content</p>')
        })
    })

    describe('Dynamic partials with dot notation', () => {
        it('should resolve nested object properties', () => {
            engine.partial('premium', '<div>Premium User</div>')
            engine.partial('basic', '<div>Basic User</div>')

            const result = engine.render('[[> (user.tier) ]]', {
                user: {
                    tier: 'premium'
                }
            })

            expect(result).toContain('Premium User')
        })

        it('should handle deep nested properties', () => {
            engine.partial('videoCard', '<div>Video Component</div>')
            engine.partial('imageCard', '<div>Image Component</div>')

            const result = engine.render('[[> (item.media.type) ]]', {
                item: {
                    media: {
                        type: 'videoCard'
                    }
                }
            })

            expect(result).toContain('Video Component')
        })

        it('should handle missing nested properties gracefully', () => {
            engine.partial('fallback', '<div>Fallback</div>')

            const result = engine.render('[[> (user.settings.theme) ]]', {
                user: { settings: {} }
            })

            // Should render empty string if variable doesn't resolve to a string
            expect(result).toBe('')
        })
    })

    describe('Dynamic partials in loops', () => {
        it('should render different partials for each item', () => {
            engine.partial('imageItem', '<div class="image">Image</div>')
            engine.partial('videoItem', '<div class="video">Video</div>')
            engine.partial('textItem', '<div class="text">Text</div>')

            const template = `
        [[ items.forEach(item => { ]]
          [[> (item.type) ]]
        [[ }) ]]
      `

            const result = engine.render(template, {
                items: [
                    { type: 'imageItem' },
                    { type: 'videoItem' },
                    { type: 'textItem' }
                ]
            })

            expect(result).toContain('class="image"')
            expect(result).toContain('class="video"')
            expect(result).toContain('class="text"')
        })

        it('should handle array of dynamic partial names', () => {
            engine.partial('section1', '<section>First</section>')
            engine.partial('section2', '<section>Second</section>')
            engine.partial('section3', '<section>Third</section>')

            const template = `
        [[ sections.forEach(sectionName => { ]]
          [[> (sectionName) ]]
        [[ }) ]]
      `

            const result = engine.render(template, {
                sections: ['section1', 'section2', 'section3']
            })

            expect(result).toContain('First')
            expect(result).toContain('Second')
            expect(result).toContain('Third')
        })
    })

    describe('Dynamic partials with conditionals', () => {
        it('should render different partials based on condition', () => {
            engine.partial('loading', '<div class="spinner">Loading...</div>')
            engine.partial('error', '<div class="error">Error occurred</div>')
            engine.partial('success', '<div class="success">Data loaded</div>')

            const template = '[[> (state) ]]'

            const result1 = engine.render(template, { state: 'loading' })
            const result2 = engine.render(template, { state: 'error' })
            const result3 = engine.render(template, { state: 'success' })

            expect(result1).toContain('Loading...')
            expect(result2).toContain('Error occurred')
            expect(result3).toContain('Data loaded')
        })

        it('should work with inline conditionals', () => {
            engine.partial('authenticated', '<nav>User Menu</nav>')
            engine.partial('guest', '<nav>Login</nav>')

            const template = `
        [[ const navType = isAuthenticated ? 'authenticated' : 'guest'; ]]
        [[> (navType) ]]
      `

            const result = engine.render(template, { isAuthenticated: true })
            expect(result).toContain('User Menu')
        })
    })

    describe('Combining dynamic with static partials', () => {
        it('should handle both dynamic and static partials in same template', () => {
            engine.partial('header', '<header>Static Header</header>')
            engine.partial('dynamicContent', '<main>Dynamic Content</main>')
            engine.partial('footer', '<footer>Static Footer</footer>')

            const template = `
        [[> header ]]
        [[> (contentType) ]]
        [[> footer ]]
      `

            const result = engine.render(template, {
                contentType: 'dynamicContent'
            })

            expect(result).toContain('Static Header')
            expect(result).toContain('Dynamic Content')
            expect(result).toContain('Static Footer')
        })

        it('should render multiple dynamic partials', () => {
            engine.partial('nav1', '<nav>Nav 1</nav>')
            engine.partial('nav2', '<nav>Nav 2</nav>')
            engine.partial('aside1', '<aside>Sidebar 1</aside>')
            engine.partial('aside2', '<aside>Sidebar 2</aside>')

            const template = `
        [[> (navType) ]]
        [[> (sidebarType) ]]
      `

            const result = engine.render(template, {
                navType: 'nav1',
                sidebarType: 'aside2'
            })

            expect(result).toContain('Nav 1')
            expect(result).toContain('Sidebar 2')
        })
    })

    describe('Error handling', () => {
        it('should throw error if dynamic partial does not exist', () => {
            const template = '[[> (partialName) ]]'

            expect(() => {
                engine.render(template, { partialName: 'nonexistent' })
            }).toThrow('Partial "nonexistent" not found')
        })

        it('should keep original syntax if variable is undefined', () => {
            engine.partial('test', '<div>Test</div>')

            const result = engine.render('[[> (unknownVar) ]]', { unknownVar: undefined })

            // Should render empty string since variable is undefined
            expect(result).toBe('')
        })

        it('should keep original syntax if variable is not a string', () => {
            const result1 = engine.render('[[> (number) ]]', { number: 123 })
            const result2 = engine.render('[[> (bool) ]]', { bool: true })
            const result3 = engine.render('[[> (obj) ]]', { obj: {} })

            // Should render empty strings since variables are not strings
            expect(result1).toBe('')
            expect(result2).toBe('')
            expect(result3).toBe('')
        })

        it('should handle empty variable name gracefully', () => {
            const result = engine.render('[[> () ]]', {})
            // Should render empty string for empty variable name
            expect(result).toBe('')
        })
    })

    describe('Dynamic partials with variables', () => {
        it('should render dynamic partial containing variables', () => {
            engine.partial('greeting', '<h1>Bonjour [[= name ]]!</h1>')
            engine.partial('farewell', '<h1>Au revoir [[= name ]]!</h1>')

            const result = engine.render('[[> (messageType) ]]', {
                messageType: 'greeting',
                name: 'Alice'
            })

            expect(result).toBe('<h1>Bonjour Alice!</h1>')
        })

        it('should pass all context to dynamically selected partial', () => {
            engine.partial('userCard', `
        <div class="user">
          <h2>[[= user.name ]]</h2>
          <p>[[= user.email ]]</p>
        </div>
      `)

            const result = engine.render('[[> (cardType) ]]', {
                cardType: 'userCard',
                user: {
                    name: 'Bob',
                    email: 'bob@example.com'
                }
            })

            expect(result).toContain('Bob')
            expect(result).toContain('bob@example.com')
        })
    })

    describe('Edge cases', () => {
        it('should handle partial names with underscores', () => {
            engine.partial('user_profile', '<div>Profile</div>')

            const result = engine.render('[[> (type) ]]', {
                type: 'user_profile'
            })

            expect(result).toBe('<div>Profile</div>')
        })

        it('should handle partial names with numbers', () => {
            engine.partial('header2', '<h2>Header 2</h2>')

            const result = engine.render('[[> (headerName) ]]', {
                headerName: 'header2'
            })

            expect(result).toBe('<h2>Header 2</h2>')
        })

        it('should handle partial names with hyphens', () => {
            engine.partial('nav-bar', '<nav>Navigation</nav>')

            const result = engine.render('[[> (component) ]]', {
                component: 'nav-bar'
            })

            expect(result).toBe('<nav>Navigation</nav>')
        })

        it('should not interfere with static partial resolution', () => {
            engine.partial('static', '<div>Static</div>')

            const result = engine.render('[[> static ]]', {})

            expect(result).toBe('<div>Static</div>')
        })
    })

    describe('Real-world use cases', () => {
        it('should render component library based on config', () => {
            engine
                .partial('button', '<button class="btn">Button</button>')
                .partial('link', '<a href="#">Link</a>')
                .partial('icon', '<i class="icon"></i>')

            const template = `
        [[ components.forEach(comp => { ]]
          [[> (comp.type) ]]
        [[ }) ]]
      `

            const result = engine.render(template, {
                components: [
                    { type: 'button' },
                    { type: 'link' },
                    { type: 'icon' }
                ]
            })

            expect(result).toContain('btn')
            expect(result).toContain('Link')
            expect(result).toContain('icon')
        })

        it('should render different layouts based on user role', () => {
            engine
                .partial('adminLayout', '<div class="admin-layout">[[= content ]]</div>')
                .partial('userLayout', '<div class="user-layout">[[= content ]]</div>')
                .partial('guestLayout', '<div class="guest-layout">[[= content ]]</div>')

            const getLayout = (role) => {
                return engine.render('[[> (layoutType) ]]', {
                    layoutType: `${role}Layout`,
                    content: `Welcome ${role}`
                })
            }

            expect(getLayout('admin')).toContain('admin-layout')
            expect(getLayout('user')).toContain('user-layout')
            expect(getLayout('guest')).toContain('guest-layout')
        })

        it('should render multi-step form based on current step', () => {
            engine
                .partial('step1', '<div class="step">Step 1: Personal Info</div>')
                .partial('step2', '<div class="step">Step 2: Address</div>')
                .partial('step3', '<div class="step">Step 3: Payment</div>')
                .partial('stepComplete', '<div class="step">Complete!</div>')

            const template = '[[> (currentStep) ]]'

            const steps = [
                { name: 'step1', label: 'Step 1' },
                { name: 'step2', label: 'Step 2' },
                { name: 'step3', label: 'Step 3' },
                { name: 'stepComplete', label: 'Complete!' }
            ]

            steps.forEach(step => {
                const result = engine.render(template, { currentStep: step.name })
                expect(result).toContain(step.label)
            })
        })
    })

    describe('Cache behavior', () => {
        it('should work correctly with template cache', () => {
            engine.partial('version1', '<div>V1</div>')

            const template = '[[> (ver) ]]'
            const result1 = engine.render(template, { ver: 'version1' })

            expect(result1).toBe('<div>V1</div>')

            // Same template, different variable
            const result2 = engine.render(template, { ver: 'version1' })
            expect(result2).toBe('<div>V1</div>')
        })

        it('should update when partial is changed', () => {
            engine.partial('dynamic', '<div>Original</div>')

            const template = '[[> (name) ]]'
            const result1 = engine.render(template, { name: 'dynamic' })

            engine.partial('dynamic', '<div>Updated</div>')
            engine.clear() // Clear cache

            const result2 = engine.render(template, { name: 'dynamic' })

            expect(result1).toContain('Original')
            expect(result2).toContain('Updated')
        })
    })
})