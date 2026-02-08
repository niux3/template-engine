# TemplateEngine

[![npm version](https://img.shields.io/npm/v/@niuxe/template-engine.svg)](https://www.npmjs.com/package/@niuxe/template-engine)
[![npm downloads](https://img.shields.io/npm/dm/@niuxe/template-engine.svg)](https://www.npmjs.com/package/@niuxe/template-engine)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@niuxe/template-engine)](https://bundlephobia.com/package/@niuxe/template-engine)
[![GitHub stars](https://img.shields.io/github/stars/niux3/template-engine.svg?style=social)](https://github.com/niux3/template-engine)

> Ultra-lightweight JavaScript template engine with automatic HTML escaping, intelligent caching, and optional plugins.

**~950 bytes gzipped (core)** | Zero dependencies | ES6+ | Modular

## Why?

- **Tiny**: 27x smaller than Handlebars, 7x smaller than EJS, 3.4x smaller than Mustache.js
- **Fast**: Built-in compilation cache with LRU eviction
- **Secure**: Auto-escapes HTML by default
- **Simple**: Clean syntax, no build step required
- **Modular**: Optional plugins for partials, helpers, layouts, strict mode, and async file rendering
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

### Partials Plugin (+800 bytes)

Reusable template fragments with three modes: simple, dynamic, and parameterized.

```javascript
import { TemplateEngine } from '@niuxe/template-engine'
import { PartialsPlugin } from '@niuxe/template-engine/plugins/partials'

const engine = new TemplateEngine().use(PartialsPlugin)

engine.partial('header', '<header><h1>[[= title ]]</h1></header>')
engine.partial('footer', '<footer>© 2025</footer>')

// 1. Simple partials
const html = engine.render(`
  [[> header ]]
  <main>[[= content ]]</main>
  [[> footer ]]
`, { title: 'My Site', content: 'Welcome!' })

// 2. Dynamic partials - choose partial from variable
engine.partial('adminLayout', '<div class="admin">[[= content ]]</div>')
engine.partial('userLayout', '<div class="user">[[= content ]]</div>')

const layout = engine.render('[[> (layoutType) ]]', {
  layoutType: 'adminLayout',
  content: 'Dashboard'
})

// 3. Parameterized partials - pass custom props
engine.partial('button', `
  <button class="btn-[[= variant ]]" type="[[= type ]]">
    [[= label ]]
  </button>
`)

const button = engine.render(`
  [[> button variant="primary" type="submit" label="Save" ]]
`, {})
```

**Syntax:**
- Simple: `[[> partialName ]]`
- Dynamic: `[[> (variableName) ]]`
- With params: `[[> partialName key="value" ]]`

### Layout Plugin (+650 bytes)

Template inheritance with blocks, perfect for building multi-page applications with shared layouts.

```javascript
import { TemplateEngine } from '@niuxe/template-engine'
import { LayoutPlugin } from '@niuxe/template-engine/plugins/layout'

const engine = new TemplateEngine().use(LayoutPlugin)

// Define a base layout
engine.layout('base', `
  <html>
    <head>
      <title>[[= title ]]</title>
      [[block:styles]]
        <link rel="stylesheet" href="default.css">
      [[/block]]
    </head>
    <body>
      [[block:header]]
        <h1>Default Header</h1>
      [[/block]]
      [[block:content]][[/block]]
      [[block:footer]]
        <footer>© 2025</footer>
      [[/block]]
    </body>
  </html>
`)

// Extend the layout in a page template
const html = engine.render(`
  [[extends:base]]
  [[block:styles]]
    [[parent]]
    <link rel="stylesheet" href="custom.css">
  [[/block]]
  [[block:content]]
    <main>
      <h2>Welcome to my page</h2>
      <p>[[= message ]]</p>
    </main>
  [[/block]]
`, {
  title: 'Home Page',
  message: 'Hello World!'
})
```

**Features:**
- **Template inheritance**: Extend layouts with `[[extends:layoutName]]`
- **Block system**: Define and override blocks with `[[block:name]]...[[/block]]`
- **Parent content**: Include parent block content with `[[parent]]`
- **Multi-level inheritance**: Layouts can extend other layouts (up to 10 levels)
- **Nested blocks**: Blocks can contain other blocks for complex layouts

**Syntax:**
- Extend layout: `[[extends:layoutName]]`
- Define block: `[[block:name]]content[[/block]]`
- Include parent: `[[parent]]`

**Advanced example - Multi-level inheritance:**

```javascript
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
    <nav>Admin Navigation</nav>
    [[block:main]][[/block]]
  [[/block]]
`)

// Dashboard page extends admin
const page = engine.render(`
  [[extends:admin]]
  [[block:styles]]
    [[parent]]
    <link rel="dashboard.css">
  [[/block]]
  [[block:main]]
    <h1>Dashboard</h1>
    <p>Welcome, admin!</p>
  [[/block]]
`, {})
```

**Result:**
```html
<html>
  <head>
    <link rel="base.css">
    <link rel="admin.css">
    <link rel="dashboard.css">
  </head>
  <body>
    <nav>Admin Navigation</nav>
    <h1>Dashboard</h1>
    <p>Welcome, admin!</p>
  </body>
</html>
```

**Perfect for:**
- Multi-page websites with shared layouts
- Admin panels with nested layouts
- Email templates with consistent structure
- Blog themes with customizable sections

### Helpers Plugin (+200 bytes)

Custom functions for formatting and transforming data with **chainable API**.

```javascript
import { TemplateEngine } from '@niuxe/template-engine'
import { HelpersPlugin } from '@niuxe/template-engine/plugins/helpers'

const engine = new TemplateEngine().use(HelpersPlugin)

engine.helper('upper', str => str.toUpperCase())
engine.helper('lower', str => str.toLowerCase())
engine.helper('truncate', (str, len) => str.slice(0, len) + '...')
engine.helper('wrap', (str, tag) => `<${tag}>${str}</${tag}>`)
engine.helper('currency', price => `$${price.toFixed(2)}`)

// Standard usage
const html1 = engine.render(`
  <h1>[[= helpers.upper(title) ]]</h1>
  <p>Price: [[= helpers.currency(price) ]]</p>
`, { title: 'hello', price: 19.99 })
// Output: <h1>HELLO</h1><p>Price: $19.99</p>

// Chainable usage - compose transformations Unix-style
const html2 = engine.render(`
  <h1>[[-helpers(title).upper().wrap('strong') ]]</h1>
  <p>[[-helpers(description).truncate(50).lower().wrap('em') ]]</p>
`, {
  title: 'welcome',
  description: 'THIS IS A VERY LONG DESCRIPTION THAT NEEDS TO BE SHORTENED'
})
// Output: <h1><strong>WELCOME</strong></h1>
//         <p><em>this is a very long description that needs to be sho...</em></p>
```

**Features:**
- **Standard mode**: `helpers.functionName(args)` - call helpers directly
- **Chain mode**: `helpers(value).fn1().fn2()` - compose transformations
- **Unix philosophy**: Each helper does one thing, chain them together
- **Zero overhead**: Chainable proxy only created when needed

### Strict Mode Plugin (+290 bytes)

Throws errors when accessing undefined variables, helping catch typos and missing data.

```javascript
import { TemplateEngine } from '@niuxe/template-engine'
import { StrictModePlugin } from '@niuxe/template-engine/plugins/strict'

const engine = new TemplateEngine().use(StrictModePlugin)

engine.strict = true

// ❌ Throws: Variable "userName" is not defined
engine.render('[[= userName ]]', { userNaem: 'Denis' })

// ✅ Works fine
engine.render('[[= userName ]]', { userName: 'Denis' })
```

Perfect for catching refactoring errors and validating API responses.

### I18n Plugin (+230 bytes)

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

### Async Plugin (+260 bytes)

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
import {
  PartialsPlugin,
  LayoutPlugin,
  HelpersPlugin,
  StrictModePlugin,
  I18nPlugin
} from '@niuxe/template-engine/plugins'

const engine = new TemplateEngine()
  .use(PartialsPlugin)
  .use(LayoutPlugin)
  .use(HelpersPlugin)
  .use(StrictModePlugin)
  .use(I18nPlugin)

engine.strict = true
engine.locale = 'fr'
engine.partial('badge', '<span class="badge">[[= text ]]</span>')
engine.helper('upper', s => s.toUpperCase())
engine.layout('base', '<html><body>[[block:content]][[/block]]</body></html>')
engine.translations = {
  fr: { welcome: 'Bienvenue' }
}

const html = engine.render(`
  [[extends:base]]
  [[block:content]]
    [[> badge text="New" ]]
    <p>[[= t("welcome") ]] [[= helpers.upper(name) ]]</p>
  [[/block]]
`, { name: 'alice' })
```

**Total size with all plugins:** ~3.2 kio gzipped

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

### Multi-Page Website with Layouts

```javascript
import { TemplateEngine } from '@niuxe/template-engine'
import { LayoutPlugin, HelpersPlugin } from '@niuxe/template-engine/plugins'

const engine = new TemplateEngine()
  .use(LayoutPlugin)
  .use(HelpersPlugin)

engine.helper('formatDate', date => new Date(date).toLocaleDateString())

// Base layout
engine.layout('base', `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>[[= pageTitle ]] - My Site</title>
      [[block:styles]][[/block]]
    </head>
    <body>
      <header>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/blog">Blog</a>
        </nav>
      </header>
      <main>
        [[block:content]][[/block]]
      </main>
      <footer>
        <p>© [[= new Date().getFullYear() ]] My Site</p>
      </footer>
    </body>
  </html>
`)

// Blog layout extends base
engine.layout('blog', `
  [[extends:base]]
  [[block:styles]]
    <link rel="stylesheet" href="/css/blog.css">
  [[/block]]
  [[block:content]]
    <article>
      [[block:article]][[/block]]
    </article>
    <aside>
      [[block:sidebar]]
        <h3>Recent Posts</h3>
      [[/block]]
    </aside>
  [[/block]]
`)

// Blog post page
const blogPost = engine.render(`
  [[extends:blog]]
  [[block:article]]
    <h1>[[= post.title ]]</h1>
    <time>[[= helpers.formatDate(post.date) ]]</time>
    <div>[[-post.content ]]</div>
  [[/block]]
  [[block:sidebar]]
    [[parent]]
    <ul>
    [[ recent.forEach(p => { ]]
      <li><a href="/blog/[[= p.slug ]]">[[= p.title ]]</a></li>
    [[ }) ]]
    </ul>
  [[/block]]
`, {
  pageTitle: 'My First Post',
  post: {
    title: 'Hello World',
    date: '2025-01-15',
    content: '<p>Welcome to my blog!</p>'
  },
  recent: [
    { slug: 'second-post', title: 'Second Post' },
    { slug: 'third-post', title: 'Third Post' }
  ]
})
```

### Data Transformation with Chainable Helpers

```javascript
import { TemplateEngine } from '@niuxe/template-engine'
import { HelpersPlugin } from '@niuxe/template-engine/plugins/helpers'

const engine = new TemplateEngine().use(HelpersPlugin)

// Register simple, focused helpers (Unix philosophy)
engine
  .helper('upper', s => s.toUpperCase())
  .helper('lower', s => s.toLowerCase())
  .helper('truncate', (s, len) => s.length > len ? s.slice(0, len) + '...' : s)
  .helper('trim', s => s.trim())
  .helper('slugify', s => s.toLowerCase().replace(/\s+/g, '-'))
  .helper('wrap', (s, tag) => `<${tag}>${s}</${tag}>`)
  .helper('prefix', (s, pre) => pre + s)

// Compose transformations by chaining
const userCard = engine.render(`
  <div class="user-card">
    <!-- Standard helper usage -->
    <h2>[[= helpers.upper(user.name) ]]</h2>

    <!-- Chainable composition -->
    <p class="bio">[[-helpers(user.bio).trim().truncate(100).wrap('em') ]]</p>
    <p class="slug">[[= helpers(user.name).lower().slugify() ]]</p>

    <!-- Complex chains -->
    <div class="tags">
    [[ user.tags.forEach(tag => { ]]
      <span>[[-helpers(tag).upper().prefix('#').wrap('strong') ]]</span>
    [[ }) ]]
    </div>
  </div>
`, {
  user: {
    name: 'Alice Smith',
    bio: '  Software engineer passionate about clean code and minimal design. Loves open source and teaching.  ',
    tags: ['javascript', 'react', 'node']
  }
})

// Output:
// <div class="user-card">
//   <h2>ALICE SMITH</h2>
//   <p class="bio"><em>Software engineer passionate about clean code and minimal design. Loves open source and teaching.</em></p>
//   <p class="slug">alice-smith</p>
//   <div class="tags">
//     <span><strong>#JAVASCRIPT</strong></span>
//     <span><strong>#REACT</strong></span>
//     <span><strong>#NODE</strong></span>
//   </div>
// </div>
```

### Component Library with Dynamic Partials

```javascript
import { TemplateEngine } from '@niuxe/template-engine'
import { PartialsPlugin } from '@niuxe/template-engine/plugins'

const engine = new TemplateEngine().use(PartialsPlugin)

// Define components
engine.partial('button', '<button class="btn-[[= variant ]]">[[= label ]]</button>')
engine.partial('input', '<input type="[[= type ]]" placeholder="[[= placeholder ]]">')
engine.partial('card', '<div class="card-[[= theme ]]">[[= content ]]</div>')

// Render different components dynamically
const form = engine.render(`
  [[ components.forEach(comp => { ]]
    [[> (comp.type) variant="primary" label="Submit" ]]
  [[ }) ]]
`, {
  components: [
    { type: 'button' },
    { type: 'input' }
  ]
})
```

### Multi-state Component

```javascript
engine.partial('loading', '<div class="spinner">Loading...</div>')
engine.partial('error', '<div class="error">[[= message ]]</div>')
engine.partial('success', '<div class="success">[[= data ]]</div>')

// Render based on application state
const widget = engine.render('[[> (state) message="Error occurred" data="Success!" ]]', {
  state: 'loading' // Can be 'loading', 'error', or 'success'
})
```

### Email Template with Layouts and Partials

```javascript
import { TemplateEngine } from '@niuxe/template-engine'
import { LayoutPlugin, PartialsPlugin, HelpersPlugin } from '@niuxe/template-engine/plugins'

const engine = new TemplateEngine()
  .use(LayoutPlugin)
  .use(PartialsPlugin)
  .use(HelpersPlugin)

engine.helper('currency', price => `$${price.toFixed(2)}`)
engine.helper('upper', str => str.toUpperCase())
engine.helper('truncate', (str, len) => str.length > len ? str.slice(0, len) + '...' : str)
// Email base layout
engine.layout('email', `
  <!DOCTYPE html>
  <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      [[block:header]]
        <div style="background: #333; color: white; padding: 20px;">
          <h1>[[= companyName ]]</h1>
        </div>
      [[/block]]
      [[block:content]][[/block]]
      [[block:footer]]
        <div style="text-align: center; color: #666; padding: 20px;">
          <p>© [[= year ]] [[= companyName ]]. All rights reserved.</p>
        </div>
      [[/block]]
    </body>
  </html>
`)

// Partials for reusable components
engine.partial('button', `
  <a href="[[= url ]]" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px;">
    [[= text ]]
  </a>
`)

// Order confirmation email
const email = engine.render(`
  [[extends:email]]
  [[block:content]]
    <div style="padding: 20px;">
      <h2>Order Confirmation</h2>
      <p>Hi [[= helpers(userName).upper() ]],</p>
      <p>Your order #[[= orderId ]] has been confirmed.</p>

      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 2px solid #ddd;">
            <th style="text-align: left; padding: 10px;">Item</th>
            <th style="text-align: right; padding: 10px;">Price</th>
          </tr>
        </thead>
        <tbody>
        [[ items.forEach(item => { ]]
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px;">[[= helpers(item.name).truncate(30) ]]</td>
            <td style="text-align: right; padding: 10px;">[[= helpers.currency(item.price) ]]</td>
          </tr>
        [[ }) ]]
        </tbody>
        <tfoot>
          <tr>
            <td style="padding: 10px;"><strong>Total</strong></td>
            <td style="text-align: right; padding: 10px;"><strong>[[= helpers.currency(total) ]]</strong></td>
          </tr>
        </tfoot>
      </table>

      <div style="margin-top: 30px; text-align: center;">
        [[> button url="https://example.com/orders/12345" text="View Order" ]]
      </div>
    </div>
  [[/block]]
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
| + Partials Plugin (all 3 modes) | +800 bytes |
| + Layout Plugin | +650 bytes |
| + Helpers Plugin (with chaining) | +200 bytes |
| + Strict Mode Plugin | +290 bytes |
| + I18n Plugin | +230 bytes |
| + Async Plugin | +260 bytes |
| **All plugins combined** | **~3.3 kio** |

### Comparison with alternatives

| Library | Size (gzipped) | Partials | Layouts | Dynamic Partials | Params Partials | Helpers | I18n | Async |
|---------|---------------|----------|---------|------------------|-----------------|---------|------|-------|
| **TemplateEngine (core)** | 950 bytes | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **TemplateEngine (full)** | 3.3 kio | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mustache.js | 3.2 kio | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| EJS | 7 kio | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Handlebars | 26 kio | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Nunjucks | 32 kio | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |

**TemplateEngine is:**
- **Same size as Mustache.js** (core: 950 bytes vs 3.2 kio) **but with more features when using plugins**
- **2.1× lighter** than EJS (full: 3.3 kio vs 7 kio)
- **7.9× lighter** than Handlebars (full: 3.3 kio vs 26 kio)
- **9.7× lighter** than Nunjucks (full: 3.3 kio vs 32 kio)
- **More features than Handlebars for ~8× less** (layouts + all features: 3.3 kio vs 26 kio)

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
- Component-based development (with Dynamic + Params plugins)
- Layout inheritance (with Layout plugin)

❌ **What it doesn't do:**
- No precompilation to static files
- No advanced i18n (plurals, date/currency formatting - use i18next instead)
- No sandboxing (templates can execute any JavaScript)

**When to use:**
- SPAs where bundle size matters
- Component libraries and design systems
- Multi-page websites with shared layouts
- Simple server-side rendering
- Email templates
- Web components

**When NOT to use:**
- User-submitted templates (security risk)
- Complex CMS with untrusted content

## Migration from Handlebars

```javascript
// Handlebars
{{> header}}
<h1>{{title}}</h1>
{{#each items}}
  <li>{{name}}</li>
{{/each}}

// TemplateEngine (equivalent features, 8× smaller!)
[[> header ]]
<h1>[[= title ]]</h1>
[[ items.forEach(item => { ]]
  <li>[[= item.name ]]</li>
[[ }) ]]

// Handlebars dynamic partials
{{> (whichPartial) }}

// TemplateEngine (with PartialsPlugin)
[[> (whichPartial) ]]

// Handlebars with parameters
{{> card title="Hello" theme="dark" }}

// TemplateEngine (with PartialsPlugin)
[[> card title="Hello" theme="dark" ]]
```

Main differences:
- `{{}}` → `[[ ]]`
- `{{var}}` → `[[= var ]]`
- `{{{raw}}}` → `[[-raw ]]`
- `{{> name}}` → `[[> name ]]` (requires PartialsPlugin)
- `{{> (dynamic)}}` → `[[> (dynamic) ]]` (PartialsPlugin supports this)
- `{{> name param="value"}}` → `[[> name param="value" ]]` (PartialsPlugin supports this)
- `{{#each}}` → `[[ forEach ]]` (native JavaScript)

## Migration from Nunjucks

```javascript
// Nunjucks
{% extends "base.html" %}
{% block content %}
  <h1>{{ title }}</h1>
{% endblock %}

// TemplateEngine (with LayoutPlugin - 10× smaller!)
[[extends:base]]
[[block:content]]
  <h1>[[= title ]]</h1>
[[/block]]

// Nunjucks parent block
{% block styles %}
  {{ super() }}
  <link rel="custom.css">
{% endblock %}

// TemplateEngine
[[block:styles]]
  [[parent]]
  <link rel="custom.css">
[[/block]]
```

Main differences:
- `{% %}` → `[[ ]]`
- `{{ var }}` → `[[= var ]]`
- `{% extends "base" %}` → `[[extends:base]]`
- `{% block name %}` → `[[block:name]]`
- `{{ super() }}` → `[[parent]]`
- `{% include %}` → `[[> name ]]` (requires PartialsPlugin)

## Contributing

Found a bug? Open an issue with a minimal reproduction.

Want to add a plugin? PRs welcome! Keep it small and focused.

## Support the project

If you find this engine useful, please consider giving it a ⭐ on [GitHub](https://github.com/niux3/template-engine). It helps more developers discover the project!

## License

MIT

## Acknowledgments

Inspired by Handlebars, EJS, Nunjucks, Underscore templates, and the pursuit of minimalism.

---

**Built with ❤️ for developers who care about bundle size.**