/**
 * Params Decorator - Adds parameter support to PartialsPlugin
 * Syntax: [[> card title="Hello" color="red" ]]
 * @param {Plugin} basePlugin - Base PartialsPlugin
 * @returns {Plugin}
 */
export const withParams = (basePlugin) => (engine, ctx) => {
    // Initialize base plugin first
    basePlugin(engine, ctx)

    // Inject engine and partials into template scope
    if (!ctx.extraParams) ctx.extraParams = []
    if (!ctx.extraArgs) ctx.extraArgs = []
    ctx.extraParams.push('__e', '__p')
    ctx.extraArgs.push(engine, engine._partials)

    // Add params preprocessor BEFORE simple partials
    ctx.preprocessors.unshift((tpl) => {
        return tpl.replace(
            /\[\[>\s*([a-zA-Z0-9_-]+)\s+((?:[a-zA-Z0-9_-]+="[^"]*"\s*)+)\]\]/g,
            (_, n, ps) => {
                const params = Object.fromEntries(
                    [...ps.matchAll(/([a-zA-Z0-9_-]+)="([^"]*)"/g)].map(([, k, v]) =>
                        [k, v === 'true' ? true : v === 'false' ? false : isNaN(v) || v === '' ? v : +v]
                    )
                )
                return `[[- (function(){const t=__p.get('${n}');if(!t)throw new Error('Partial "${n}" not found');return __e.render(t,Object.assign({},data,${JSON.stringify(params)}))})() ]]`
            }
        )
    })
}