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

### Helpers Plugin (+150 bytes)

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
  HelpersPlugin,
  StrictModePlugin,
  I18nPlugin
} from '@niuxe/template-engine/plugins'

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
  [[> badge text="New" ]]
  <p>[[= t("welcome") ]] [[= helpers.upper(name) ]]</p>
`, { name: 'alice' })
```

**Total size with all plugins:** ~2.9 kio gzipped
```

**Total size with all plugins:** ~2.2 kio gzipped

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
| + Helpers Plugin | +150 bytes |
| + Strict Mode Plugin | +290 bytes |
| + Async Plugin | +260 bytes |
| + I18n Plugin | +230 bytes |
| **All plugins combined** | **~2.9 kio** |

### Comparison with alternatives

| Library | Size (gzipped) | Partials | Dynamic Partials | Params Partials | Helpers | I18n | Async |
|---------|---------------|----------|------------------|-----------------|---------|------|-------|
| **TemplateEngine (core)** | 950 bytes | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **TemplateEngine (full)** | 2.9 kio | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mustache.js | 3.2 kio | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| EJS | 4.3 kio | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Handlebars | 26 kio | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

**TemplateEngine is:**
- **3.4× lighter** than Mustache.js (core: 950 bytes vs 3.2 kio)
- **7× lighter** than EJS (core: 950 bytes vs 7 kio)
- **27× lighter** than Handlebars (core: 950 bytes vs 26 kio)
- **Same features as Handlebars for 9× less** (full: 2.9 kio vs 26 kio)

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

❌ **What it doesn't do:**
- No layout inheritance (use partials instead)
- No precompilation to static files
- No advanced i18n (plurals, date/currency formatting - use i18next instead)
- No sandboxing (templates can execute any JavaScript)

**When to use:**
- SPAs where bundle size matters
- Component libraries and design systems
- Simple server-side rendering
- Email templates
- Web components

**When NOT to use:**
- User-submitted templates (security risk)
- Complex CMS with untrusted content
- Need for advanced template inheritance

## Migration from Handlebars

```javascript
// Handlebars
{{> header}}
<h1>{{title}}</h1>
{{#each items}}
  <li>{{name}}</li>
{{/each}}

// TemplateEngine (equivalent features, 14× smaller!)
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

## Contributing

Found a bug? Open an issue with a minimal reproduction.

Want to add a plugin? PRs welcome! Keep it small and focused.

## License

MIT

## Acknowledgments

Inspired by Handlebars, EJS, Underscore templates, and the pursuit of minimalism.

---

**Built with ❤️ for developers who care about bundle size.**