const n=(t,r)=>{t.strict=!1,r.wrappers||(r.wrappers=[]),r.wrappers.push((p,e)=>t.strict?`
            const handler = {
                get(t, p) {
                    if (p === Symbol.unscopables || p === 'constructor') return t[p];
                    if (!(p in t)) throw new Error('Variable "' + p + '" is not defined');
                    return t[p];
                }
            };
            const proxy = new Proxy(data, handler);
            with(proxy) { ${e} }
        `:p)};export{n as StrictModePlugin};
