export class TemplateEngine {
    #template = ''
    #tokens = []
    #escape = {}

    constructor() {
        this.#escape = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        }
    }

    #tokenize(template) {
        let regex = /\[\[=?-?([\s\S]+?)\]\]|([^\[]+)/g,
            match,
            tokens = []

        while ((match = regex.exec(template)) !== null) {
            if (match[1]) {
                let code = match[1].trim()
                if (match[0].startsWith("[[=")) {
                    tokens.push({ type: "OUTPUT_ESCAPED", value: code })
                } else if (match[0].startsWith("[[-")) {
                    tokens.push({ type: "OUTPUT_RAW", value: code })
                } else {
                    tokens.push({ type: "JS_CODE", value: code })
                }
            } else if (match[2]) {
                tokens.push({ type: "TEXT", value: match[2] })
            }
        }

        return tokens
    }

    #compile(template) {
        let code = `let output = ""; \n`,
            escapeHTML = str => String(str).replace(/[&<>"']/g, (match) => {
                return this.#escape[match] || match
            })
        this.#tokens = this.#tokenize(template)
        this.#tokens.forEach(token => {
            switch (token.type) {
                case "TEXT":
                    code += `output += ${JSON.stringify(token.value)};\n`
                    break
                case "OUTPUT_ESCAPED":
                    code += `output += escapeHTML(${token.value});\n`
                    break
                case "OUTPUT_RAW":
                    code += `output += ${token.value};\n`
                    break
                case "JS_CODE":
                    code += `${token.value}\n`
                    break
            }
        })

        code += `return output;`
        return new Function("data", "escapeHTML", `with(data) { ${code} }`)
    }

    render(template, data) {
        let renderFunction = this.#compile(template)
        return renderFunction(data, str => str.replace(/[&<>"']/g, match => {
            return this.#escape[match] || match
        }))
    }
}
