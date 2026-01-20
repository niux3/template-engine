/**
 * Dynamic Partials Plugin
 * Allows partials to be selected dynamically using variables
 *
 * Usage: [[> (varName) ]]
 * Example: [[> (headerType) ]] where headerType = "adminHeader" or "userHeader"
 *
 * IMPORTANT: When used in loops/blocks with local variables, you need to
 * explicitly pass the context. The partial template will be rendered with
 * the current data scope merged with any explicitly defined variables.
 *
 * @param {object} engine - TemplateEngine instance
 * @param {object} ctx - Context object
 */
export function DynamicPartialsPlugin(engine, ctx) {
    // Store partial templates
    const originalPartial = engine.partial
    if (!engine._partialTemplates) {
        engine._partialTemplates = new Map()
    }

    engine.partial = function(name, template) {
        engine._partialTemplates.set(name, template)
        return originalPartial.call(this, name, template)
    }

    // Inject the engine and partials map into template scope
    if (!ctx.extraParams) ctx.extraParams = []
    if (!ctx.extraArgs) ctx.extraArgs = []

    ctx.extraParams.push('__engine', '__partials')
    ctx.extraArgs.push(engine, engine._partialTemplates)

    // Add wrapper to capture local variables
    if (!ctx.wrappers) ctx.wrappers = []

    // Add preprocessor
    if (!ctx.preprocessors) {
        ctx.preprocessors = []
    }

    ctx.preprocessors.unshift((tpl) => {
        // Transform [[> (varPath) ]] into code that renders the partial
        return tpl.replace(
            /\[\[>\s*\(\s*([a-zA-Z0-9_.-]*)\s*\)\s*\]\]/g,
            (match, varPath) => {
                // Handle empty variable name
                if (!varPath) {
                    return ''
                }

                // Build safe accessor with try-catch
                const safeAccessor = varPath.includes('.')
                    ? varPath.split('.').map((part, i) => i === 0 ? part : `?.${part}`).join('')
                    : varPath

                // The trick: we need to extract the context object from the variable path
                // For example: item.type → we need to pass 'item' as context
                // For simple vars: headerType → we pass the whole data object
                const contextVar = varPath.includes('.') ? varPath.split('.')[0] : null
                const contextCode = contextVar
                    ? `(typeof ${contextVar} === 'object' ? Object.assign({}, data, ${contextVar}) : data)`
                    : 'data'

                return `[[- (function() {
                    try {
                        const __pn = ${safeAccessor};
                        if (typeof __pn !== 'string') return '';
                        const __pt = __partials.get(__pn);
                        if (!__pt) throw new Error('Partial "' + __pn + '" not found');

                        return __engine.render(__pt, ${contextCode});
                    } catch (e) {
                        if (e.message && e.message.includes('Partial') || e.message.includes('not defined')) throw e;
                        return '';
                    }
                })() ]]`
            }
        )
    })
}