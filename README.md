# TemplateEngine

[![npm version](https://img.shields.io/npm/v/@niuxe/template-engine.svg)](https://www.npmjs.com/package/@niuxe/template-engine)
[![npm downloads](https://img.shields.io/npm/dm/@niuxe/template-engine.svg)](https://www.npmjs.com/package/@niuxe/template-engine)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@niuxe/template-engine)](https://bundlephobia.com/package/@niuxe/template-engine)
[![GitHub stars](https://img.shields.io/github/stars/niux3/template-engine.svg?style=social)](https://github.com/niux3/template-engine)

> Ultra-lightweight JavaScript template engine with automatic HTML escaping, intelligent caching, and optional plugins.

**~950 bytes gzipped (core)** | Zero dependencies | ES6+ | Modular

## Why?

- **Tiny**: 40x smaller than Handlebars, 15x smaller than EJS
- **Fast**: Built-in compilation cache with LRU eviction
- **Secure**: Auto-escapes HTML by default
- **Simple**: Clean syntax, no build step required
- **Modular**: Optional plugins for partials, helpers, strict mode, and async file rendering
- **Pay for what you use**: Core is 950 bytes, add only the plugins you need

## Installation

```bash
npm install @niuxe/template-engine
```

```javascript
import { TemplateEngine } from '@niuxe/template-engine'
```

## Quick Start

```javascript
const engine = new TemplateEngine()

const html = engine.render(`
  <h1>[[= title ]]</h1>
  <ul>
  [[ items.forEach(item => { ]]
    <li>[[= item.name ]] - $[[= item.price ]]</li>
  [[ }) ]]
  </ul>
`, {
  title: 'Products',
  items: [
    { name: 'Coffee', price: 3.50 },
    { name: 'Tea', price: 2.75 }
  ]
})
```

## Syntax

### Output (escaped)
```javascript
[[= variable ]]
[[= user.name ]]
[[= items[0] ]]
```
Auto-escapes HTML entities (`<`, `>`, `&`, `"`, `'`)

### Output (raw)
```javascript
[[-htmlContent ]]
```
Renders unescaped HTML (use with caution)

### JavaScript Code
```javascript
[[ if (user.admin) { ]]
  <button>Admin Panel</button>
[[ } else { ]]
  <button>Dashboard</button>
[[ } ]]

[[ items.forEach(item => { ]]
  <div>[[= item ]]</div>
[[ }) ]]

[[ for (let i = 0; i < 10; i++) { ]]
  <span>[[= i ]]</span>
[[ } ]]
```

## Plugins

TemplateEngine uses a modular plugin system. Import only what you need to keep your bundle small.

### Partials Plugin (+120 bytes)

Reusable template fragments.

```javascript
import { TemplateEngine } from '@niuxe/template-engine'
import { PartialsPlugin } from '@niuxe/template-engine/plugins/partials'

const engine = new TemplateEngine().use(PartialsPlugin)

engine.partial('header', '<header><h1>[[= title ]]</h1></header>')
engine.partial('footer', '<footer>© 2025</footer>')

const html = engine.render(`
  [[> header ]]
  <main>[[= content ]]</main>
  [[> footer ]]
`, { title: 'My Site', content: 'Welcome!' })
```

**Syntax:** `[[> partialName ]]`

### Helpers Plugin (+80 bytes)

Custom functions for formatting and transforming data.

```javascript
import { TemplateEngine } from '@niuxe/template-engine'
import { HelpersPlugin } from '@niuxe/template-engine/plugins/helpers'

const engine = new TemplateEngine().use(HelpersPlugin)

engine.helper('uppercase', str => str.toUpperCase())
engine.helper('currency', price => `$${price.toFixed(2)}`)

const html = engine.render(`
  <h1>[[= helpers.uppercase(title) ]]</h1>
  <p>Price: [[= helpers.currency(price) ]]</p>
`, { title: 'hello', price: 19.99 })
// Output: <h1>HELLO</h1><p>Price: $19.99</p>
```

**Built-in helpers object:** `helpers.functionName(args)`

### Strict Mode Plugin (+100 bytes)

Throws errors when accessing undefined variables, helping catch typos and missing data.

```javascript
import { TemplateEngine } from '@niuxe/template-engine'
import { StrictModePlugin } from '@niuxe/template-engine/plugins/strict'

const engine = new TemplateEngine().use(StrictModePlugin)

engine.strict = true

// ❌ Throws: Variable "userName" is not defined
engine.render('[[= userName ]]', { userNaem: 'John' })

// ✅ Works fine
engine.render('[[= userName ]]', { userName: 'John' })
```

Perfect for catching refactoring errors and validating API responses.

### I18n Plugin (+180 bytes)

Multi-language support with variable interpolation.

```javascript
import { TemplateEngine } from '@niuxe/template-engine'
import { I18nPlugin } from '@niuxe/template-engine/plugins/i18n'

const engine = new TemplateEngine().use(I18nPlugin)

engine.translations = {
  en: {
    greeting: 'Hello {name}!',
    items_count: 'You have {count} items'
  },
  fr: {
    greeting: 'Bonjour {name} !',
    items_count: 'Vous avez {count} articles'
  }
}

// Switch language
engine.locale = 'fr'

const html = engine.render(`
  <h1>[[= t("greeting", {name: userName}) ]]</h1>
  <p>[[= t("items_count", {count: items.length}) ]]</p>
`, { userName: 'Alice', items: [1, 2, 3] })
// Output: <h1>Bonjour Alice !</h1><p>Vous avez 3 articles</p>
```

**Features:**
- Variable interpolation with `{varName}` syntax
- Dynamic locale switching
- Fallback to key if translation missing
- Works with all template features (loops, conditionals)

**Note:** For complex i18n needs (plurals, dates, currencies), consider using [i18next](https://www.i18next.com/) with the HelpersPlugin.

### Async Plugin (+60 bytes)

Read and render templates from files (Node.js only).

```javascript
import { TemplateEngine } from '@niuxe/template-engine'
import { AsyncPlugin } from '@niuxe/template-engine/plugins/async'

const engine = new TemplateEngine().use(AsyncPlugin)

// Read template from file system
const html = await engine.renderFile('./templates/email.html', {
  name: 'Alice',
  orderId: 12345
})
```

**Node.js only.** Throws error in browser environments.

### Combining Plugins

Plugins can be chained together:

```javascript
import { TemplateEngine } from '@niuxe/template-engine'
import { PartialsPlugin, HelpersPlugin, StrictModePlugin, I18nPlugin } from '@niuxe/template-engine/plugins'

const engine = new TemplateEngine()
  .use(PartialsPlugin)
  .use(HelpersPlugin)
  .use(StrictModePlugin)
  .use(I18nPlugin)

engine.strict = true
engine.locale = 'fr'
engine.partial('badge', '<span class="badge">[[= text ]]</span>')
engine.helper('upper', s => s.toUpperCase())
engine.translations = {
  fr: { welcome: 'Bienvenue' }
}

const html = engine.render(`
  [[> badge ]]
  <p>[[= t("welcome") ]] [[= helpers.upper(name) ]]</p>
`, { text: 'New', name: 'alice' })
```

**Total size:** ~1060 bytes gzipped (all plugins combined)

## Core API

### `render(template, data)`
Compiles and renders a template with given data.

```javascript
engine.render('<h1>[[= title ]]</h1>', { title: 'Hello' })
// Returns: '<h1>Hello</h1>'
```

**Parameters:**
- `template` (string): Template string
- `data` (object): Data object for interpolation

**Returns:** Rendered HTML string

**Throws:** Error if template is invalid or compilation fails

### `use(plugin)`
Adds a plugin to the engine.

```javascript
engine.use(PartialsPlugin)
```

**Returns:** `this` (for chaining)

### `clear()`
Clears the compilation cache.

```javascript
engine.clear()
```

**Returns:** `this` (for chaining)

Useful when:
- Updating partials or helpers
- Managing memory in long-running processes
- Testing

## Advanced Examples

### Multilingual Website with I18n

```javascript
import { TemplateEngine } from '@niuxe/template-engine'
import { I18nPlugin, HelpersPlugin } from '@niuxe/template-engine/plugins'

const engine = new TemplateEngine()
  .use(I18nPlugin)
  .use(HelpersPlugin)

// Setup translations
engine.translations = {
  en: {
    nav_home: 'Home',
    nav_about: 'About',
    nav_contact: 'Contact',
    welcome: 'Welcome, {name}!',
    user_joined: 'Member since {date}',
    items_in_cart: 'You have {count} items in your cart'
  },
  fr: {
    nav_home: 'Accueil',
    nav_about: 'À propos',
    nav_contact: 'Contact',
    welcome: 'Bienvenue, {name} !',
    user_joined: 'Membre depuis {date}',
    items_in_cart: 'Vous avez {count} articles dans votre panier'
  },
  es: {
    nav_home: 'Inicio',
    nav_about: 'Acerca de',
    nav_contact: 'Contacto',
    welcome: '¡Bienvenido, {name}!',
    user_joined: 'Miembro desde {date}',
    items_in_cart: 'Tienes {count} artículos en tu carrito'
  }
}

// Helper for date formatting
engine.helper('formatDate', d => new Date(d).toLocaleDateString())

// Render in different languages
const template = `
  <nav>
    <a href="/">[[= t("nav_home") ]]</a>
    <a href="/about">[[= t("nav_about") ]]</a>
    <a href="/contact">[[= t("nav_contact") ]]</a>
  </nav>
  <h1>[[= t("welcome", {name: user.name}) ]]</h1>
  <p>[[= t("user_joined", {date: helpers.formatDate(user.joined)}) ]]</p>
  <p>[[= t("items_in_cart", {count: cart.length}) ]]</p>
`

// English
engine.locale = 'en'
const htmlEn = engine.render(template, {
  user: { name: 'Alice', joined: '2024-01-15' },
  cart: [1, 2, 3]
})

// French
engine.locale = 'fr'
engine.clear()
const htmlFr = engine.render(template, {
  user: { name: 'Alice', joined: '2024-01-15' },
  cart: [1, 2, 3]
})
```

### Email Template with Partials

```javascript
engine.partial('header', `
  <div style="background: #333; color: white; padding: 20px;">
    <h1>[[= companyName ]]</h1>
  </div>
`)

engine.partial('footer', `
  <div style="text-align: center; color: #666;">
    <p>© [[= year ]] [[= companyName ]]. All rights reserved.</p>
  </div>
`)

const email = engine.render(`
  [[> header ]]
  <div style="padding: 20px;">
    <p>Hi [[= userName ]],</p>
    <p>Your order #[[= orderId ]] has been confirmed.</p>
    <ul>
    [[ items.forEach(item => { ]]
      <li>[[= item.name ]] - [[= helpers.currency(item.price) ]]</li>
    [[ }) ]]
    </ul>
    <p><strong>Total: [[= helpers.currency(total) ]]</strong></p>
  </div>
  [[> footer ]]
`, {
  companyName: 'ACME Inc',
  year: 2025,
  userName: 'Alice',
  orderId: 12345,
  items: [
    { name: 'Product A', price: 29.99 },
    { name: 'Product B', price: 49.99 }
  ],
  total: 79.98
})
```

### Dashboard with Conditionals and Helpers

```javascript
engine.helper('formatDate', date => new Date(date).toLocaleDateString())
engine.helper('status', active => active ? '✅ Active' : '❌ Inactive')

const dashboard = engine.render(`
  <div class="dashboard">
    <h1>Welcome, [[= user.name ]]!</h1>

    [[ if (user.role === 'admin') { ]]
      <div class="admin-panel">
        <h2>Admin Controls</h2>
        <button>Manage Users</button>
      </div>
    [[ } ]]

    <div class="stats">
      <p>Member since: [[= helpers.formatDate(user.joined) ]]</p>
      <p>Status: [[= helpers.status(user.active) ]]</p>
      <p>Projects: [[= user.projects.length ]]</p>
    </div>

    <div class="projects">
      <h2>Your Projects</h2>
      [[ if (user.projects.length === 0) { ]]
        <p>No projects yet. Create one to get started!</p>
      [[ } else { ]]
        <ul>
        [[ user.projects.forEach(project => { ]]
          <li>
            <strong>[[= project.name ]]</strong>
            - [[= helpers.status(project.active) ]]
          </li>
        [[ }) ]]
        </ul>
      [[ } ]]
    </div>
  </div>
`, {
  user: {
    name: 'Alice',
    role: 'admin',
    joined: '2024-01-15',
    active: true,
    projects: [
      { name: 'Project Alpha', active: true },
      { name: 'Project Beta', active: false }
    ]
  }
})
```

## Performance

- **Compilation cache**: Templates are compiled once, cached for reuse
- **Cache limit**: 100 templates max (LRU eviction)
- **Benchmarks** (10,000 renders):
  - First render: ~2ms (compilation + render)
  - Cached renders: ~0.3ms (cache hit)

## Security

### HTML Escaping
By default, `[[= ... ]]` escapes HTML to prevent XSS:

```javascript
engine.render('[[= html ]]', { html: '<script>alert("xss")</script>' })
// Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
```

### Raw Output
Use `[[-... ]]` for trusted HTML only:

```javascript
engine.render('[[-trustedHTML ]]', { trustedHTML: '<b>Safe</b>' })
// Returns: '<b>Safe</b>'
```

⚠️ **Never** use raw output with user-generated content.

### Template Injection
Templates use JavaScript's `with()` statement and execute arbitrary code. **Only use templates from trusted sources.** Never allow users to submit their own template strings.

Use **Strict Mode** to catch undefined variables and prevent typos from becoming security issues.

## Size Breakdown

| Component | Minified + Gzipped |
|-----------|-------------------|
| **Core Engine** | **950 bytes** |
| + Partials Plugin | +270 bytes |
| + Helpers Plugin | +150 bytes |
| + Strict Mode Plugin | +290 bytes |
| + Async Plugin | +260 bytes |
| + I18n Plugin | +230 bytes |
| **All plugins combined** | **~2150 bytes** |

### Comparison with alternatives

| Library | Size (gzipped) | Partials | Helpers | I18n | Async |
|---------|---------------|----------|---------|------|-------|
| **TemplateEngine (core)** | 950 bytes | ❌ | ❌ | ❌ | ❌ |
| **TemplateEngine (full)** | 2150 bytes | ✅ | ✅ | ✅ | ✅ |
| Mustache | 9 KB | ✅ | ❌ | ❌ | ❌ |
| EJS | 7 KB | ✅ | ❌ | ❌ | ✅ |
| Handlebars | 20 KB | ✅ | ✅ | ❌ | ❌ |

## Browser Support

Works in all modern browsers and Node.js 14+.

**Requires:**
- ES6 classes
- Private fields (`#`)
- Template literals
- `Map`
- `Proxy` (for Strict Mode plugin only)

## Limitations

✅ **What it does well:**
- Small bundle size
- Fast rendering
- Simple syntax
- Plugin extensibility

❌ **What it doesn't do:**
- No layout inheritance (use partials instead)
- No precompilation to static files
- No advanced i18n (plurals, date/currency formatting - use i18next instead)
- No sandboxing (templates can execute any JavaScript)

**When to use:**
- SPAs where bundle size matters
- Simple server-side rendering
- Email templates
- Web components

**When NOT to use:**
- User-submitted templates (security risk)
- Complex CMS with untrusted content
- Need for advanced template inheritance

## Migration from EJS

```javascript
// EJS
<%- include('header') %>
<h1><%= title %></h1>
<% if (show) { %>
  <p>Visible</p>
<% } %>

// TemplateEngine
[[> header ]]
<h1>[[= title ]]</h1>
[[ if (show) { ]]
  <p>Visible</p>
[[ } ]]
```

Main differences:
- `<% %>` → `[[ ]]`
- `<%= %>` → `[[= ]]`
- `<%- %>` → `[[-]]`
- `<%- include('name') %>` → `[[> name ]]` (requires PartialsPlugin)

## Contributing

Found a bug? Open an issue with a minimal reproduction.

Want to add a plugin? PRs welcome! Keep it small and focused.

## License

MIT

## Acknowledgments

Inspired by EJS, Underscore templates, and the pursuit of minimalism.

---

**Built with ❤️ for developers who care about bundle size.**