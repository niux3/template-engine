/**
 * Partial Parameters Plugin
 * Allows passing named parameters to partials
 *
 * Usage: [[> partialName key1="value1" key2="value2" ]]
 * Example: [[> card title="Hello" color="red" size="large" ]]
 *
 * Parameters are merged with the current context, with params taking precedence
 *
 * @param {object} engine - TemplateEngine instance
 * @param {object} ctx - Context object
 */
export function ParamsPartialsPlugin(engine, ctx) {
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

    ctx.extraParams.push('__engineParams', '__partialsParams')
    ctx.extraArgs.push(engine, engine._partialTemplates)

    // Add preprocessor
    if (!ctx.preprocessors) {
        ctx.preprocessors = []
    }

    ctx.preprocessors.unshift((tpl) => {
        // Transform [[> partialName key="value" ]] into code
        return tpl.replace(
            /\[\[>\s*([a-zA-Z0-9_-]+)\s+((?:[a-zA-Z0-9_-]+="[^"]*"\s*)+)\]\]/g,
            (match, partialName, paramsStr) => {
                // Parse parameters into object literal code
                const params = {}
                paramsStr.replace(/([a-zA-Z0-9_-]+)="([^"]*)"/g, (_, key, value) => {
                    // Try to parse as number or boolean
                    if (value === 'true') {
                        params[key] = true
                    } else if (value === 'false') {
                        params[key] = false
                    } else if (!isNaN(value) && value !== '') {
                        params[key] = Number(value)
                    } else {
                        params[key] = value
                    }
                })

                // Generate code that merges data with params and renders
                return `[[- (function() {
                    const __pt = __partialsParams.get('${partialName}');
                    if (!__pt) throw new Error('Partial "${partialName}" not found');
                    const __params = ${JSON.stringify(params)};
                    const __mergedData = Object.assign({}, data, __params);
                    return __engineParams.render(__pt, __mergedData);
                })() ]]`;
            }
        )
    })
}