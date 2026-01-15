/**
 * Partials plugin - enables reusable template fragments
 * @type {import('../TemplateEngine.js').Plugin}
 * @example
 * engine.use(PartialsPlugin)
 * engine.partial('header', '<h1>Title</h1>')
 * engine.render('[[> header ]]', {})
 */
export const PartialsPlugin = (engine, ctx) => {
    const partials = new Map()

    /**
     * Register a partial template
     * @param {string} name - Partial name
     * @param {string} template - Partial template string
     * @returns {object} Engine instance for chaining
     */
    engine.partial = (name, tpl) => {
        partials.set(name, tpl)
        return engine
    }

    const resolvePartials = (tpl, depth = 0) => {
        if (depth > 10) {
            throw new Error('Partial nesting too deep (max 10 levels)')
        }

        return tpl.replace(/\[\[>\s*(\w+)\s*\]\]/g, (_, name) => {
            if (!partials.has(name)) {
                throw new Error(`Partial "${name}" not found`)  // ← FIX ICI
            }
            return resolvePartials(partials.get(name), depth + 1)
        })
    }

    if (!ctx.preprocessors) ctx.preprocessors = []
    ctx.preprocessors.push(tpl => resolvePartials(tpl))
}