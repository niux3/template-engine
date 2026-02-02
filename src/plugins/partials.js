/**
 * Unified Partials Plugin - supports all 3 modes in one plugin
 * Modes: [[> header ]], [[> card title="Hello" ]], [[> (varName) ]]
 * @type {import('../TemplateEngine.js').Plugin}
 */
export const PartialsPlugin = (engine, ctx) => {
    const partials = new Map()

    engine.partial = (name, tpl) => {
        partials.set(name, tpl)
        return engine
    }

    if (!ctx.extraParams) ctx.extraParams = []
    if (!ctx.extraArgs) ctx.extraArgs = []
    ctx.extraParams.push('__e', '__p')
    ctx.extraArgs.push(engine, partials)

    if (!ctx.preprocessors) ctx.preprocessors = []

    // Helper to generate render code
    const mkRender = (pName, data) =>
        `[[- (function(){const t=__p.get(${pName});if(!t)throw new Error('Partial "'+${pName}+'" not found');return __e.render(t,${data})})() ]]`

    ctx.preprocessors.push((tpl) => {
        let r = tpl

        // 1. Partials with params: [[> card title="Hello" color="red" ]]
        r = r.replace(
            /\[\[>\s*([a-zA-Z0-9_-]+)\s+((?:[a-zA-Z0-9_-]+="[^"]*"\s*)+)\]\]/g,
            (_, n, ps) => {
                const params = Object.fromEntries(
                    [...ps.matchAll(/([a-zA-Z0-9_-]+)="([^"]*)"/g)].map(([, k, v]) =>
                        [k, v === 'true' ? true : v === 'false' ? false : isNaN(v) || v === '' ? v : +v]
                    )
                )
                return mkRender(`'${n}'`, `Object.assign({},data,${JSON.stringify(params)})`)
            }
        )

        // 2. Dynamic partials: [[> (varName) ]]
        r = r.replace(
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

        // 3. Simple partials: [[> header ]] (recursive)
        const resolve = (s, d = 0) => {
            if (d > 10) throw new Error('Partial nesting too deep (max 10 levels)')
            return s.replace(/\[\[>\s*(\w+)\s*\]\]/g, (_, n) => {
                if (!partials.has(n)) throw new Error(`Partial "${n}" not found`)
                return resolve(partials.get(n), d + 1)
            })
        }

        return resolve(r)
    })
}