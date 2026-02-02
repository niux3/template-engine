/**
 * Dynamic Decorator - Adds dynamic partial selection
 * Syntax: [[> (variableName) ]]
 * @deprecated Use unified PartialsPlugin instead
 * @see partials.js
 * @param {Plugin} basePlugin - Base PartialsCorePlugin (or already decorated)
 * @returns {Plugin}
 */
export const withDynamic = (basePlugin) => (engine, ctx) => {
    console.warn('withDynamic is deprecated, use PartialsPlugin from partials.js')
    // Initialize base plugin first (might already have withParams)
    basePlugin(engine, ctx)

    // Inject engine and partials if not already done
    if (!ctx.extraParams) ctx.extraParams = []
    if (!ctx.extraArgs) ctx.extraArgs = []
    if (!ctx.extraParams.includes('__e')) {
        ctx.extraParams.push('__e', '__p')
        ctx.extraArgs.push(engine, engine._partials)
    }

    // Add dynamic preprocessor BEFORE params and simple partials
    ctx.preprocessors.unshift((tpl) => {
        return tpl.replace(
            /\[\[>\s*\(\s*([a-zA-Z0-9_.-]*)\s*\)\s*\]\]/g,
            (_, vp) => {
                if (!vp) return ''
                const acc = vp.includes('.')
                    ? vp.split('.').map((p, i) => i === 0 ? p : `?.${p}`).join('')
                    : vp
                const cv = vp.includes('.') ? vp.split('.')[0] : null
                const ctx = cv ? `(typeof ${cv}==='object'?Object.assign({},data,${cv}):data)` : 'data'
                return `[[- (function(){try{const n=${acc};if(typeof n!=='string')return '';const t=__p.get(n);if(!t)throw new Error('Partial "'+n+'" not found');return __e.render(t,${ctx})}catch(e){if(e.message&&(e.message.includes('Partial')||e.message.includes('not defined')))throw e;return ''}})() ]]`
            }
        )
    })
}