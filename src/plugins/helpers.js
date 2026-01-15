/**
 * Helpers plugin - adds custom helper functions
 * @type {import('../TemplateEngine.js').Plugin}
 * @example
 * engine.use(HelpersPlugin)
 * engine.helper('upper', s => s.toUpperCase())
 * engine.render('[[= helpers.upper(name) ]]', { name: 'alice' })
 */
export const HelpersPlugin = (engine, ctx) => {
    const helpers = {}

    /**
     * Register a helper function
     * @param {string} name - Helper name
     * @param {Function} fn - Helper function
     * @returns {object} Engine instance for chaining
     */
    engine.helper = (name, fn) => {
        helpers[name] = fn
        return engine
    }

    // Ajouter helpers en paramètre de la fonction compilée
    if (!ctx.extraParams) ctx.extraParams = []
    ctx.extraParams.push('helpers')

    if (!ctx.extraArgs) ctx.extraArgs = []
    ctx.extraArgs.push(helpers)
}