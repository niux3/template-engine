/**
 * Base Partials Plugin - Simple partials only
 * Syntax: [[> header ]]
 * @deprecated Use unified PartialsPlugin instead
 * @see partials.js
 * @type {import('../TemplateEngine.js').Plugin}
 */
export const PartialsCorePlugin = (engine, ctx) => {
    console.warn('PartialsCorePlugin is deprecated, use PartialsPlugin from partials.js')
    const partials = new Map()

    engine.partial = (name, tpl) => {
        partials.set(name, tpl)
        return engine
    }

    if (!ctx.preprocessors) ctx.preprocessors = []

    // Simple partials with recursive resolution
    const resolve = (s, d = 0) => {
        if (d > 10) throw new Error('Partial nesting too deep (max 10 levels)')
        return s.replace(/\[\[>\s*(\w+)\s*\]\]/g, (_, n) => {
            if (!partials.has(n)) throw new Error(`Partial "${n}" not found`)
            return resolve(partials.get(n), d + 1)
        })
    }

    ctx.preprocessors.push(tpl => resolve(tpl))

    // Expose partials map for decorators
    engine._partials = partials
}