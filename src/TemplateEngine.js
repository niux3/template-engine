/**
 * @typedef {Object} PluginContext
 * @property {Array<(tpl: string) => string>} [preprocessors] - Template preprocessors
 * @property {Array<(fnCode: string, innerCode: string) => string>} [wrappers] - Code wrappers
 * @property {string[]} [extraParams] - Extra function parameters
 * @property {any[]} [extraArgs] - Extra function arguments
 */

/**
 * @callback Plugin
 * @param {TemplateEngine} engine - Template engine instance
 * @param {PluginContext} context - Plugin context
 * @returns {void}
 */

/**
 * Ultra-lightweight template engine with plugin support
 * @class
 */
export class TemplateEngine {
    #cache = new Map()
    #maxCache = 100
    #escape = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
    #escapeRe = /[&<>"']/g
    #escapeHTML = str => String(str).replace(this.#escapeRe, m => this.#escape[m])
    #plugins = []
    #context = {}

    /**
     * Add a plugin to the engine
     * @param {Plugin} plugin - Plugin function
     * @returns {this} Engine instance for chaining
     * @example
     * engine.use(PartialsPlugin).use(HelpersPlugin)
     */
    use(plugin) {
        plugin(this, this.#context)
        this.#plugins.push(plugin)
        return this
    }

    #compile(tpl) {
        const cacheKey = tpl
        if (this.#cache.has(cacheKey)) return this.#cache.get(cacheKey)

        // Hook: permettre aux plugins de transformer le template
        let processedTpl = tpl
        if (this.#context.preprocessors) {
            this.#context.preprocessors.forEach(fn => {
                processedTpl = fn(processedTpl)
            })
        }

        const re = /\[\[=?-?([\s\S]+?)\]\]|([^\[]+)/g
        let m, code = 'let output="";\n'

        while ((m = re.exec(processedTpl))) {
            if (m[1]) {
                const c = m[1].trim(), pre = m[0].slice(0, 3)
                code += pre === '[[=' ? `output+=escapeHTML(${c});\n` : pre === '[[-' ? `output+=${c};\n` : `${c}\n`
            } else if (m[2]) {
                code += `output+=${JSON.stringify(m[2])};\n`
            }
        }

        code += 'return output;'

        // Hook: permettre aux plugins de wrapper le code
        let fnCode = `with(data) { ${code} }`
        if (this.#context.wrappers) {
            this.#context.wrappers.forEach(fn => {
                fnCode = fn(fnCode, code)
            })
        }

        try {
            // Hook: permettre aux plugins d'ajouter des paramètres
            const params = ['data', 'escapeHTML', ...(this.#context.extraParams || [])]
            const fn = new Function(...params, fnCode)

            if (this.#cache.size >= this.#maxCache) {
                this.#cache.delete(this.#cache.keys().next().value)
            }

            this.#cache.set(cacheKey, fn)
            return fn
        } catch (err) {
            throw new Error(`Template compilation failed: ${err.message}`)
        }
    }

    /**
     * Render a template with data
     * @param {string} template - Template string with [[= variable ]], [[-raw]], and [[ code ]] syntax
     * @param {Object} [data={}] - Data object for interpolation
     * @returns {string} Rendered HTML string
     * @throws {Error} If template is invalid or compilation fails
     * @example
     * const html = engine.render('[[= name ]]', { name: 'Alice' })
     * // Returns: 'Alice'
     */
    render(tpl, data = {}) {
        if (!tpl) throw new Error('Template required')

        try {
            // Préparer les arguments pour les plugins
            const args = [data, this.#escapeHTML, ...(this.#context.extraArgs || [])]
            return this.#compile(tpl)(...args)
        } catch (err) {
            throw new Error(`Template render failed: ${err.message}`)
        }
    }

    /**
     * Clear the compilation cache
     * @returns {this} Engine instance for chaining
     * @example
     * engine.clear()
     */
    clear() {
        this.#cache.clear()
        return this
    }
}