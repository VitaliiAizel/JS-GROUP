const ComponentCreator = (() => {
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

            render() {
                // HTML
                this.shadowRoot.innerHTML = this.html || '';

                // CSS
                const styleSheets = new CSSStyleSheet();
                styleSheets.replaceSync(
                    `
                    [ngFor] {
                        display: none;
                    }
                    ${this.css}
                    `
                );
                this.shadowRoot.adoptedStyleSheets = [styleSheets];

                // JS
                const script = document.createElement('script');
                script.innerText = `
                    (async () => {
                        const document = window.document.querySelector("${name}").shadowRoot;
                        ${this.js}
                    })();
                `;

                this.shadowRoot.append(script);
            }
        }

        customElements.define(name, CustomComponent);
    }
    
    return {
        register: register
    }
})();
