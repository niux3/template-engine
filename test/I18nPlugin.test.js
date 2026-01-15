import { describe, it, expect, beforeEach } from 'vitest'
import { TemplateEngine } from '../src/TemplateEngine.js'
import { I18nPlugin } from '../src/plugins/i18n.js'

describe('I18nPlugin', () => {
    let engine

    beforeEach(() => {
        engine = new TemplateEngine().use(I18nPlugin)
    })

    describe('Plugin initialization', () => {
        it('should add locale property to engine', () => {
            expect(engine.locale).toBeDefined()
            expect(typeof engine.locale).toBe('string')
        })

        it('should default locale to "en"', () => {
            expect(engine.locale).toBe('en')
        })

        it('should add translations property to engine', () => {
            expect(engine.translations).toBeDefined()
            expect(typeof engine.translations).toBe('object')
        })

        it('should initialize translations as empty object', () => {
            expect(engine.translations).toEqual({})
        })
    })

    describe('Basic translation', () => {
        beforeEach(() => {
            engine.translations = {
                en: {
                    hello: 'Hello',
                    goodbye: 'Goodbye',
                    welcome: 'Welcome'
                },
                fr: {
                    hello: 'Bonjour',
                    goodbye: 'Au revoir',
                    welcome: 'Bienvenue'
                }
            }
        })

        it('should translate simple key in English', () => {
            engine.locale = 'en'
            const result = engine.render('[[= t("hello") ]]', {})
            expect(result).toBe('Hello')
        })

        it('should translate simple key in French', () => {
            engine.locale = 'fr'
            const result = engine.render('[[= t("hello") ]]', {})
            expect(result).toBe('Bonjour')
        })

        it('should translate multiple keys', () => {
            engine.locale = 'en'
            const result = engine.render(`
        [[= t("hello") ]] and [[= t("goodbye") ]]
      `, {})
            expect(result.trim()).toBe('Hello and Goodbye')
        })

        it('should return key when translation not found', () => {
            engine.locale = 'en'
            const result = engine.render('[[= t("missing.key") ]]', {})
            expect(result).toBe('missing.key')
        })

        it('should return key when locale not found', () => {
            engine.locale = 'es'
            const result = engine.render('[[= t("hello") ]]', {})
            expect(result).toBe('hello')
        })
    })

    describe('Translation with variables', () => {
        beforeEach(() => {
            engine.translations = {
                en: {
                    greeting: 'Hello {name}!',
                    welcome_user: 'Welcome, {firstName} {lastName}!',
                    item_count: 'You have {count} items',
                    complex: 'Hello {name}, you have {count} messages from {sender}'
                },
                fr: {
                    greeting: 'Bonjour {name} !',
                    welcome_user: 'Bienvenue, {firstName} {lastName} !',
                    item_count: 'Vous avez {count} articles',
                    complex: 'Bonjour {name}, vous avez {count} messages de {sender}'
                }
            }
        })

        it('should replace single variable', () => {
            engine.locale = 'en'
            const result = engine.render('[[= t("greeting", {name: userName}) ]]', {
                userName: 'Alice'
            })
            expect(result).toBe('Hello Alice!')
        })

        it('should replace multiple variables', () => {
            engine.locale = 'en'
            const result = engine.render(`
        [[= t("welcome_user", {firstName: first, lastName: last}) ]]
      `, {
                first: 'Patrick',
                last: 'Michu'
            })
            expect(result.trim()).toBe('Welcome, Patrick Michu!')
        })

        it('should replace numeric variables', () => {
            engine.locale = 'en'
            const result = engine.render('[[= t("item_count", {count: num}) ]]', {
                num: 42
            })
            expect(result).toBe('You have 42 items')
        })

        it('should replace all occurrences of variable', () => {
            engine.translations.en.repeat = '{name} said {name} three times'

            const result = engine.render('[[= t("repeat", {name: user}) ]]', {
                user: 'Bob'
            })
            expect(result).toBe('Bob said Bob three times')
        })

        it('should handle complex translations with multiple vars', () => {
            engine.locale = 'fr'
            const result = engine.render(`[[= t("complex", {name: user, count: num, sender: from}) ]]`, {
                user: 'Alice',
                num: 5,
                from: 'Bob'
            })
            expect(result).toBe('Bonjour Alice, vous avez 5 messages de Bob')
        })

        it('should handle empty variables object', () => {
            engine.locale = 'en'
            const result = engine.render('[[= t("greeting", {}) ]]', {})
            expect(result).toBe('Hello {name}!')
        })

        it('should handle missing variables in object', () => {
            engine.locale = 'en'
            const result = engine.render('[[= t("greeting", {other: "value"}) ]]', {})
            expect(result).toBe('Hello {name}!')
        })
    })

    describe('Locale switching', () => {
        beforeEach(() => {
            engine.translations = {
                en: { title: 'English Title' },
                fr: { title: 'Titre Français' },
                es: { title: 'Título Español' }
            }
        })

        it('should switch locale dynamically', () => {
            engine.locale = 'en'
            let result = engine.render('[[= t("title") ]]', {})
            expect(result).toBe('English Title')

            engine.locale = 'fr'
            engine.clear() // Clear cache
            result = engine.render('[[= t("title") ]]', {})
            expect(result).toBe('Titre Français')
        })

        it('should handle multiple locales', () => {
            const template = '[[= t("title") ]]'

            engine.locale = 'en'
            expect(engine.render(template, {})).toBe('English Title')

            engine.locale = 'fr'
            engine.clear()
            expect(engine.render(template, {})).toBe('Titre Français')

            engine.locale = 'es'
            engine.clear()
            expect(engine.render(template, {})).toBe('Título Español')
        })
    })

    describe('Integration with template data', () => {
        beforeEach(() => {
            engine.translations = {
                en: {
                    user_profile: 'Profile of {name}',
                    age_info: '{name} is {age} years old'
                }
            }
            engine.locale = 'en'
        })

        it('should use template data in translations', () => {
            const result = engine.render(`
        <h1>[[= t("user_profile", {name: user.name}) ]]</h1>
      `, {
                user: { name: 'Alice' }
            })
            expect(result).toContain('Profile of Alice')
        })

        it('should combine translation with other template logic', () => {
            const result = engine.render(`
        <div>
          [[= t("user_profile", {name: user.name}) ]]
          [[ if (user.active) { ]]
            <span>Active</span>
          [[ } ]]
        </div>
      `, {
                user: { name: 'Bob', active: true }
            })
            expect(result).toContain('Profile of Bob')
            expect(result).toContain('Active')
        })

        it('should work in loops', () => {
            engine.translations.en.item_label = 'Item: {name}'

            const result = engine.render(`
        <ul>
        [[ items.forEach(item => { ]]
          <li>[[= t("item_label", {name: item}) ]]</li>
        [[ }) ]]
        </ul>
      `, {
                items: ['A', 'B', 'C']
            })

            expect(result).toContain('Item: A')
            expect(result).toContain('Item: B')
            expect(result).toContain('Item: C')
        })
    })

    describe('Edge cases', () => {
        it('should handle empty translation key', () => {
            engine.locale = 'en'
            engine.translations.en = { '': 'Empty key' }

            const result = engine.render('[[= t("") ]]', {})
            expect(result).toBe('Empty key')
        })

        it('should handle keys with special characters', () => {
            engine.locale = 'en'
            engine.translations.en = {
                'common.hello': 'Hello',
                'errors.404': 'Not Found'
            }

            expect(engine.render('[[= t("common.hello") ]]', {})).toBe('Hello')
            expect(engine.render('[[= t("errors.404") ]]', {})).toBe('Not Found')
        })

        it('should handle translations with special HTML characters', () => {
            engine.locale = 'en'
            engine.translations.en = {
                html: 'Hello <strong>World</strong>'
            }

            const result = engine.render('[[= t("html") ]]', {})
            expect(result).toBe('Hello &lt;strong&gt;World&lt;/strong&gt;')
        })

        it('should not escape with raw output', () => {
            engine.locale = 'en'
            engine.translations.en = {
                html: 'Hello <strong>World</strong>'
            }

            const result = engine.render('[[-t("html") ]]', {})
            expect(result).toBe('Hello <strong>World</strong>')
        })

        it('should handle undefined translations gracefully', () => {
            engine.locale = 'en'
            engine.translations = {}

            const result = engine.render('[[= t("missing") ]]', {})
            expect(result).toBe('missing')
        })

        it('should handle numeric variable values', () => {
            engine.locale = 'en'
            engine.translations.en = {
                count: 'Count: {value}'
            }

            const result = engine.render('[[= t("count", {value: num}) ]]', {
                num: 0
            })
            expect(result).toBe('Count: 0')
        })

        it('should handle boolean variable values', () => {
            engine.locale = 'en'
            engine.translations.en = {
                status: 'Active: {active}'
            }

            const result = engine.render('[[= t("status", {active: flag}) ]]', {
                flag: false
            })
            expect(result).toBe('Active: false')
        })
    })

    describe('Real-world use cases', () => {
        it('should render multilingual user interface', () => {
            engine.translations = {
                en: {
                    nav_home: 'Home',
                    nav_about: 'About',
                    nav_contact: 'Contact',
                    welcome: 'Welcome, {name}!'
                },
                fr: {
                    nav_home: 'Accueil',
                    nav_about: 'À propos',
                    nav_contact: 'Contact',
                    welcome: 'Bienvenue, {name} !'
                }
            }

            const template = `
        <nav>
          <a href="/">[[= t("nav_home") ]]</a>
          <a href="/about">[[= t("nav_about") ]]</a>
          <a href="/contact">[[= t("nav_contact") ]]</a>
        </nav>
        <h1>[[= t("welcome", {name: user}) ]]</h1>
      `

            // English
            engine.locale = 'en'
            let result = engine.render(template, { user: 'Alice' })
            expect(result).toContain('Home')
            expect(result).toContain('About')
            expect(result).toContain('Welcome, Alice!')

            // French
            engine.locale = 'fr'
            engine.clear()
            result = engine.render(template, { user: 'Alice' })
            expect(result).toContain('Accueil')
            expect(result).toContain('À propos')
            expect(result).toContain('Bienvenue, Alice !')
        })

        it('should render multilingual email template', () => {
            engine.translations = {
                en: {
                    email_subject: 'Order Confirmation',
                    email_greeting: 'Hello {name},',
                    email_body: 'Your order #{orderId} has been confirmed.',
                    email_total: 'Total: ${amount}',
                    email_footer: 'Thank you for your order!'
                },
                fr: {
                    email_subject: 'Confirmation de commande',
                    email_greeting: 'Bonjour {name},',
                    email_body: 'Votre commande #{orderId} a été confirmée.',
                    email_total: 'Total : {amount}€',
                    email_footer: 'Merci pour votre commande !'
                }
            }

            const template = `
        <h1>[[= t("email_subject") ]]</h1>
        <p>[[= t("email_greeting", {name: customer}) ]]</p>
        <p>[[= t("email_body", {orderId: order}) ]]</p>
        <p>[[= t("email_total", {amount: total}) ]]</p>
        <p>[[= t("email_footer") ]]</p>
      `

            engine.locale = 'fr'
            const result = engine.render(template, {
                customer: 'Marie',
                order: 12345,
                total: 99.99
            })

            expect(result).toContain('Confirmation de commande')
            expect(result).toContain('Bonjour Marie,')
            expect(result).toContain('commande #12345')
            expect(result).toContain('Total : 99.99€')
        })

        it('should handle form labels and errors', () => {
            engine.translations = {
                en: {
                    form_name: 'Name',
                    form_email: 'Email',
                    form_submit: 'Submit',
                    error_required: '{field} is required',
                    error_invalid_email: 'Invalid email address'
                }
            }
            engine.locale = 'en'

            const result = engine.render(`
        <form>
          <label>[[= t("form_name") ]]</label>
          <label>[[= t("form_email") ]]</label>
          [[ if (errors.email) { ]]
            <span class="error">[[= t("error_invalid_email") ]]</span>
          [[ } ]]
          <button>[[= t("form_submit") ]]</button>
        </form>
      `, {
                errors: { email: true }
            })

            expect(result).toContain('Name')
            expect(result).toContain('Email')
            expect(result).toContain('Invalid email address')
            expect(result).toContain('Submit')
        })
    })
})