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

            handleNgFor(data) {
                return data;
            }

            handleHtml() {
                let result = this.html;

                result = this.handleNgFor(result);

                return result;
            }

            render() {
                // HTML
                this.shadowRoot.innerHTML = this.handleHtml();

                // CSS
                const styleSheets = new CSSStyleSheet();
                styleSheets.replaceSync(this.css);
                this.shadowRoot.adoptedStyleSheets = [styleSheets];

                // JS
                if (this.js && this.js.setScope && typeof this.js.setScope === 'function') {
                    this.js.setScope(this);
                }

                const script = document.createElement('script');
                script.innerText = this.js;
                this.shadowRoot.append(script);
            }
        }

        customElements.define(name, CustomComponent);
    }

    return {
        register: register
    }
})();
