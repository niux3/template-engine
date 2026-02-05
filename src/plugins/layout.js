/**
 * Layout Plugin with Blocks Inheritance
 * Complements partials by providing template inheritance
 *
 * Syntax:
 *   [[extends:layoutName]]           - Extend a layout
 *   [[block:name]]...[[/block]]      - Define/override a block
 *   [[parent]]                        - Include parent block content
 *
 * Example:
 *   // base.html
 *   <html>
 *     <head>[[block:head]]<title>Default</title>[[/block]]</head>
 *     <body>[[block:content]][[/block]]</body>
 *   </html>
 *
 *   // page.html
 *   [[extends:base]]
 *   [[block:head]]
 *     [[parent]]
 *     <meta charset="utf-8">
 *   [[/block]]
 *   [[block:content]]
 *     <h1>Hello World</h1>
 *   [[/block]]
 *
 * @type {import('./TemplateEngine.js').Plugin}
 */
export const LayoutPlugin = (engine, ctx) => {
    const layouts = new Map()

    engine.layout = (name, template) => {
        layouts.set(name, template)
        return engine
    }

    const extractBlocks = (template) => {
        const blocks = {}
        const blockStartRegex = /\[\[block:(\w+)\]\]/g
        const blockEndRegex = /\[\[\/block\]\]/g

        let match
        while ((match = blockStartRegex.exec(template))) {
            const blockName = match[1]
            const startPos = blockStartRegex.lastIndex

            // Trouver le [[/block]] correspondant en comptant les niveaux
            let level = 1
            let pos = startPos
            let endPos = -1

            while (level > 0 && pos < template.length) {
                // Chercher le prochain [[block: ou [[/block]]
                const nextStart = template.indexOf('[[block:', pos)
                const nextEnd = template.indexOf('[[/block]]', pos)

                if (nextEnd === -1) break // Pas de [[/block]] trouvé

                if (nextStart !== -1 && nextStart < nextEnd) {
                    // On a trouvé un nouveau [[block: avant le [[/block]]
                    level++
                    pos = nextStart + 8 // Avancer après [[block:
                } else {
                    // On a trouvé un [[/block]]
                    level--
                    if (level === 0) {
                        endPos = nextEnd
                        break
                    }
                    pos = nextEnd + 10 // Avancer après [[/block]]
                }
            }

            if (endPos !== -1) {
                blocks[blockName] = template.substring(startPos, endPos).trim()
            }
        }

        return blocks
    }

    const extractExtends = (template) => {
        const m = template.match(/\[\[extends:(\w+)\]\]/)
        return m ? m[1] : null
    }

    const resolveInheritance = (template, childBlocks = {}, depth = 0) => {
        if (depth > 10) throw new Error('Layout inheritance too deep (max 10 levels)')

        const layoutName = extractExtends(template)
        const templateBlocks = extractBlocks(template)

        // Pas d'extends = template racine
        if (!layoutName) {
            let result = template
            result = result.replace(/\[\[block:(\w+)\]\]([\s\S]*?)\[\[\/block\]\]/g,
                (match, blockName, defaultContent) => {
                    const blockContent = childBlocks[blockName] || templateBlocks[blockName]
                    if (blockContent !== undefined) {
                        if (blockContent.includes('[[parent]]')) {
                            return blockContent.replace(/\[\[parent\]\]/g, defaultContent.trim())
                        }
                        return blockContent
                    }
                    return defaultContent
                }
            )

            // Après avoir remplacé les blocks principaux, remplacer AUSSI les blocks restants
            // (cas des blocks imbriqués dans d'autres blocks)
            // childBlocks contient TOUS les blocks mergés de toute la chaîne
            result = result.replace(/\[\[block:(\w+)\]\]([\s\S]*?)\[\[\/block\]\]/g,
                (match, blockName, defaultContent) => {
                    if (childBlocks[blockName] !== undefined) {
                        return childBlocks[blockName]
                    }
                    return defaultContent.trim() || '' // Nettoyer les blocks vides
                }
            )

            result = result.replace(/\[\[extends:\w+\]\]/, '')
            return result
        }

        // Il y a un extends
        if (!layouts.has(layoutName)) throw new Error(`Layout "${layoutName}" not found`)

        // Résoudre [[parent]] maintenant avec templateBlocks (parent immédiat)
        const resolvedChildBlocks = {}
        for (const [name, content] of Object.entries(childBlocks)) {
            if (content.includes('[[parent]]')) {
                const parentContent = templateBlocks[name] || ''
                resolvedChildBlocks[name] = content.replace(/\[\[parent\]\]/g, parentContent.trim())
            } else {
                resolvedChildBlocks[name] = content
            }
        }

        // Merger
        const mergedBlocks = { ...templateBlocks, ...resolvedChildBlocks }

        return resolveInheritance(layouts.get(layoutName), mergedBlocks, depth + 1)
    }

    if (!ctx.preprocessors) ctx.preprocessors = []
    ctx.preprocessors.unshift((template) => {
        try {
            return resolveInheritance(template, {}, 0)
        } catch (err) {
            throw new Error(`Layout resolution failed: ${err.message}`)
        }
    })
}