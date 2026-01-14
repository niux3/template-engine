export class TemplateEngine {
  #cache = new Map()
  #maxCache = 100
  #escape = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
  #escapeRe = /[&<>"']/g

  #escapeHTML = str => String(str).replace(this.#escapeRe, m => this.#escape[m])

  #compile(tpl) {
    if (this.#cache.has(tpl)) return this.#cache.get(tpl)

    const re = /\[\[=?-?([\s\S]+?)\]\]|([^\[]+)/g
    let m, code = 'let output="";\n'

    while ((m = re.exec(tpl))) {
      if (m[1]) {
        const c = m[1].trim(), pre = m[0].slice(0, 3)
        code += pre === '[[=' ? `output+=escapeHTML(${c});\n` : pre === '[[-' ? `output+=${c};\n` : `${c}\n`
      } else if (m[2]) {
        code += `output+=${JSON.stringify(m[2])};\n`
      }
    }

    code += 'return output;'

    try {
      const fn = new Function('data', 'escapeHTML', `with(data){${code}}`)

      if (this.#cache.size >= this.#maxCache) {
        this.#cache.delete(this.#cache.keys().next().value)
      }

      this.#cache.set(tpl, fn)
      return fn
    } catch (err) {
      throw new Error(`Template compilation failed: ${err.message}`)
    }
  }

  render(tpl, data = {}) {
    if (!tpl) throw new Error('Template required')

    try {
      return this.#compile(tpl)(data, this.#escapeHTML)
    } catch (err) {
      throw new Error(`Template render failed: ${err.message}`)
    }
  }

  clear() { this.#cache.clear() }
}
