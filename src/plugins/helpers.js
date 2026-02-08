/**
 * Helpers plugin - adds custom helper functions
 * @type {import('../TemplateEngine.js').Plugin}
 * @example
 * engine.use(HelpersPlugin)
 * engine.helper('upper', s => s.toUpperCase())
 * engine.render('[[= helpers.upper(name) ]]', { name: 'alice' })
 */
export const HelpersPlugin = (engine, ctx) => {
    const fns = {}

    engine.helper = (name, fn) => {
        fns[name] = fn
        return engine
    }

    const createChain = (val) => new Proxy({ _: val }, {
        get: (t, k) => k === 'valueOf' || k === 'toString' ? () => t._
            : fns[k] ? (...a) => createChain(fns[k](t._, ...a)) : undefined
    })

    const helpers = new Proxy(createChain, {
        get: (target, key) => fns[key] || target[key],
        apply: (target, thisArg, args) => target(...args)
    })

    if (!ctx.extraParams) ctx.extraParams = []
    ctx.extraParams.push('helpers')

    if (!ctx.extraArgs) ctx.extraArgs = []
    ctx.extraArgs.push(helpers)
}