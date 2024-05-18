const ComponentWorker = (() => {
    function ngFor(source, name, data, child) {
        if (!source || !name || !data) return;
        
        const elements = source.querySelectorAll(`[ngFor="${name}"]`);
        
        for (const el of elements) {
            el.outerHTML = proceedNgFor(el, name, data, child);
        }

        Router.handleLinks();
    }

    function proceedNgFor(component, name, data, child) {
        if (!name || !data) return component;
        component.removeAttribute("ngFor");

        let result = '';

        for (let i = 0; i < data.length; i++) {
            let tmp = '';

            tmp = interpolate(component.outerHTML || component, name, data[i]);

            if (child) {
                for (const c of child) {
                    const doc = new DOMParser().parseFromString(tmp, "text/html");

                    const elements = doc.querySelectorAll(`[ngFor="${c.name}"]`);
                    for (const el of elements) {
                        el.outerHTML = proceedNgFor(el, c.name, data[i][c.field], c.child);
                    }

                    tmp = doc.body.innerHTML;
                }
            }
            
            result += `${tmp}\n`;
        }

        return result;
    }

    function interpolate(component, name, data) {
        return component.replace(/{{(.*?)}}/g, (match, key) => {
            if (key.includes(`${name}.`)) {
                return data[key.replace(`${name}.`, '').trim()] || '';
            }

            return `{{${key}}}`;
        });
    }

    return {
        ngFor: ngFor,
        interpolate: interpolate
    }
})();
