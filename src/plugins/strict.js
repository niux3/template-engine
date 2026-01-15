/**
 * Strict mode plugin - throws errors on undefined variables
 * @type {import('../TemplateEngine.js').Plugin}
 * @example
 * engine.use(StrictModePlugin)
 * engine.strict = true
 * engine.render('[[= missing ]]', {}) // Throws error
 */
export const StrictModePlugin = (engine, ctx) => {
    /**
     * Enable/disable strict mode
     * @type {boolean}
     */
    engine.strict = false

    // Wrapper le code avec Proxy si strict activé
    if (!ctx.wrappers) ctx.wrappers = []
    ctx.wrappers.push((fnCode, innerCode) => {
        if (!engine.strict) return fnCode

        return `
            const handler = {
                get(t, p) {
                    if (p === Symbol.unscopables || p === 'constructor') return t[p];
                    if (!(p in t)) throw new Error('Variable "' + p + '" is not defined');
                    return t[p];
                }
            };
            const proxy = new Proxy(data, handler);
            with(proxy) { ${innerCode} }
        `
    })
}