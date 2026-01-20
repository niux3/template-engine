function c(a,t){const i=a.partial;a._partialTemplates||(a._partialTemplates=new Map),a.partial=function(r,s){return a._partialTemplates.set(r,s),i.call(this,r,s)},t.extraParams||(t.extraParams=[]),t.extraArgs||(t.extraArgs=[]),t.extraParams.push("__engine","__partials"),t.extraArgs.push(a,a._partialTemplates),t.wrappers||(t.wrappers=[]),t.preprocessors||(t.preprocessors=[]),t.preprocessors.unshift(r=>r.replace(/\[\[>\s*\(\s*([a-zA-Z0-9_.-]*)\s*\)\s*\]\]/g,(s,e)=>{if(!e)return"";const l=e.includes(".")?e.split(".").map((p,o)=>o===0?p:`?.${p}`).join(""):e,n=e.includes(".")?e.split(".")[0]:null,_=n?`(typeof ${n} === 'object' ? Object.assign({}, data, ${n}) : data)`:"data";return`[[- (function() {
                    try {
                        const __pn = ${l};
                        if (typeof __pn !== 'string') return '';
                        const __pt = __partials.get(__pn);
                        if (!__pt) throw new Error('Partial "' + __pn + '" not found');

                        return __engine.render(__pt, ${_});
                    } catch (e) {
                        if (e.message && e.message.includes('Partial') || e.message.includes('not defined')) throw e;
                        return '';
                    }
                })() ]]`}))}export{c as DynamicPartialsPlugin};
