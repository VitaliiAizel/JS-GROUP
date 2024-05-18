const ComponentWorker = (() => {

    function register(name, path, component) {
        class CustomComponent extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({ mode: 'open' });
            }

            async connectedCallback() {
                const [html, css, js] = await Promise.all([
                    HttpClient.getFile(`${path}/${component}.html`),
                    HttpClient.getFile(`${path}/${component}.css`),
                    HttpClient.getFile(`${path}/${component}.js`)  
                ]);

                Object.assign(this, { html, css, js });

                this.render();
            }

            handleNgFor() {
                console.log('TODO: Find all ngFor');
            }

            handleHtml() {
                this.handleNgFor();
            }

            render() {
                // HTML
                this.shadowRoot.innerHTML = this.html || '';
                this.handleHtml();

                // CSS
                const styleSheets = new CSSStyleSheet();
                styleSheets.replaceSync(this.css);
                this.shadowRoot.adoptedStyleSheets = [styleSheets];

                // JS
                const script = document.createElement('script');
                script.innerText = `
                    (() => {
                        const document = window.document.querySelector("${name}").shadowRoot;
                        ${this.js}
                    })();
                `;

                this.shadowRoot.append(script);
            }
        }

        customElements.define(name, CustomComponent);
    }

    function interpolate(component, data) {
        return component.replace(/{{\s*(.*?)\s*}}/g, (match, key) => {
            return data[key.trim()] || '';
        });
    }

    return {
        register: register
    }
})();
