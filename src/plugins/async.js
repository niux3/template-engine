/**
 * Async plugin - enables file-based template rendering (Node.js only)
 * @type {import('../TemplateEngine.js').Plugin}
 * @example
 * engine.use(AsyncPlugin)
 * await engine.renderFile('./template.html', { name: 'Alice' })
 */
export const AsyncPlugin = (engine, ctx) => {
    /**
     * Render a template from a file
     * @param {string} path - File path
     * @param {Object} [data={}] - Data object for interpolation
     * @returns {Promise<string>} Rendered HTML string
     * @throws {Error} If not in Node.js environment
     */
    engine.renderFile = async (path, data = {}) => {
        if (typeof require === 'undefined') {
            throw new Error('renderFile only available in Node.js')
        }
        const fs = await import('fs/promises')
        const tpl = await fs.readFile(path, 'utf8')
        return engine.render(tpl, data)
    }
}