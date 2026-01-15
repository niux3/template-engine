/**
 * I18n plugin - multi-language support
 * @type {import('../TemplateEngine.js').Plugin}
 * @example
 * engine.use(I18nPlugin)
 * engine.locale = 'fr'
 * engine.translations = {
 *   fr: { hello: 'Bonjour {name}' }
 * }
 * engine.render('[[= t("hello", {name: "Alice"}) ]]', {})
 */
export const I18nPlugin = (engine, ctx) => {
    /**
     * Current locale (e.g., 'en', 'fr', 'es')
     * @type {string}
     */
    engine.locale = 'en'
    /**
     * Translation dictionary
     * @type {Object.<string, Object.<string, string>>}
     * @example
     * {
     *   en: { greeting: 'Hello {name}!' },
     *   fr: { greeting: 'Bonjour {name} !' }
     * }
     */
    engine.translations = {}

    // Add t() function to templates
    if (!ctx.extraParams) ctx.extraParams = []
    ctx.extraParams.push('t')

    if (!ctx.extraArgs) ctx.extraArgs = []
    ctx.extraArgs.push((key, vars = {}) => {
        let text = engine.translations[engine.locale]?.[key] || key

        // Simple variable replacement: "Hello {name}" with {name: "Patrick"}
        Object.keys(vars).forEach(k => {
            text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), vars[k])
        })

        return text
    })
}