function o(r,a){const i=r.partial;r._partialTemplates||(r._partialTemplates=new Map),r.partial=function(s,n){return r._partialTemplates.set(s,n),i.call(this,s,n)},a.extraParams||(a.extraParams=[]),a.extraArgs||(a.extraArgs=[]),a.extraParams.push("__engineParams","__partialsParams"),a.extraArgs.push(r,r._partialTemplates),a.preprocessors||(a.preprocessors=[]),a.preprocessors.unshift(s=>s.replace(/\[\[>\s*([a-zA-Z0-9_-]+)\s+((?:[a-zA-Z0-9_-]+="[^"]*"\s*)+)\]\]/g,(n,_,l)=>{const e={};return l.replace(/([a-zA-Z0-9_-]+)="([^"]*)"/g,(m,p,t)=>{t==="true"?e[p]=!0:t==="false"?e[p]=!1:!isNaN(t)&&t!==""?e[p]=Number(t):e[p]=t}),`[[- (function() {
                    const __pt = __partialsParams.get('${_}');
                    if (!__pt) throw new Error('Partial "${_}" not found');
                    const __params = ${JSON.stringify(e)};
                    const __mergedData = Object.assign({}, data, __params);
                    return __engineParams.render(__pt, __mergedData);
                })() ]]`}))}export{o as ParamsPartialsPlugin};
