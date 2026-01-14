# TemplateEngine

Ultra-lightweight JavaScript template engine with automatic HTML escaping and intelligent caching.

**~520 bytes gzipped** | Zero dependencies | ES6+ 

## Why?

- **Tiny**: 40x smaller than Handlebars, 15x smaller than EJS
- **Fast**: Built-in compilation cache with LRU eviction
- **Secure**: Auto-escapes HTML by default
- **Simple**: Clean syntax, no build step required

## Installation

```javascript
import TemplateEngine from './TemplateEngine.js'
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

## Advanced Examples

### Conditionals
```javascript
engine.render(`
  [[ if (score >= 90) { ]]
    <span class="grade-a">Excellent!</span>
  [[ } else if (score >= 70) { ]]
    <span class="grade-b">Good</span>
  [[ } else { ]]
    <span class="grade-c">Keep trying</span>
  [[ } ]]
`, { score: 85 })
```

### Loops with Index
```javascript
engine.render(`
  [[ users.forEach((user, i) => { ]]
    <div class="user-[[= i ]]">
      [[= user.name ]] 
      [[ if (user.verified) { ]]✓[[ } ]]
    </div>
  [[ }) ]]
`, { users: [...] })
```

### Complex Data
```javascript
engine.render(`
  [[ const total = items.reduce((sum, item) => sum + item.price, 0) ]]
  <p>Total: $[[= total.toFixed(2) ]]</p>
`, { items: [...] })
```

## API

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

### `clear()`
Clears the compilation cache.

```javascript
engine.clear()
```

Useful for testing or memory management in long-running processes.

## Performance

- **Compilation cache**: Templates are compiled once, cached for reuse
- **Cache limit**: 100 templates max (LRU eviction)
- **Benchmarks** (10,000 renders):
  - First render: ~2ms (compilation + render)
  - Cached renders: ~0.3ms (cache hit)

## Security

### HTML Escaping
By default, `[[= ... ]]` escapes HTML:

```javascript
engine.render('[[= html ]]', { html: '<script>alert("xss")</script>' })
// Returns: '&lt;script&gt;alert("xss")&lt;/script&gt;'
```

### Raw Output
Use `[[-... ]]` for trusted HTML only:

```javascript
engine.render('[[-trustedHTML ]]', { trustedHTML: '<b>Safe</b>' })
// Returns: '<b>Safe</b>'
```

⚠️ **Never** use raw output with user-generated content.

### Template Injection
Templates use JavaScript's `with()` statement. Only use templates from trusted sources. Never allow users to submit arbitrary templates.

## Limitations

- No partials/includes (keep it simple)
- No custom helpers (use plain JavaScript)
- No precompilation (runtime only)
- `with()` statement (deprecated but widely supported)

## Size Comparison

| Library | Minified + Gzipped |
|---------|-------------------|
| **TemplateEngine** | **520 bytes** |
| Mustache | 9 KB |
| EJS | 7 KB |
| Handlebars | 20 KB |

## Browser Support

Works in all modern browsers and Node.js 14+.

Requires:
- ES6 classes
- Private fields (`#`)
- Template literals
- `Map`

## License

GNU GENERAL PUBLIC LICENSE

## Contributing

Found a bug? Open an issue with a minimal reproduction.

---

**Pro tip:** For larger projects, consider Nunjucks. This engine shines when bundle size matters and templates are simple.
