const ComponentCreator = (() => {
    /**
     * Registers a custom web component with the given name, path, and component name.
     * The component will load HTML, CSS, and JS files from the specified path and component name.
     * 
     * @param {string} name - The name of the custom web component.
     * @param {string} path - The path where the HTML, CSS, and JS files are located.
     * @param {string} component - The name of the component (without file extension).
     */
    function register(name, path, component) {
        /**
         * CustomComponent class represents a custom web component.
         * It extends HTMLElement and implements the lifecycle methods.
         */
        class CustomComponent extends HTMLElement {
            constructor() {
                super();
            }

            /**
             * connectedCallback is called when the custom element is inserted into the DOM.
             * It fetches the HTML, CSS, and JS files and renders the component.
             */
            async connectedCallback() {
                this.showLoader();

                const [html, css, js] = await Promise.all([
                    HttpClient.getFile(`${path}/${component}.html`),
                    HttpClient.getFile(`${path}/${component}.css`),
                    HttpClient.getFile(`${path}/${component}.js`)  
                ]);

                Object.assign(this, { html, css, js });

                this.render();
            }

            /**
             * Renders default HTML between <component></component>.
             */
            showLoader() {
                this.innerHTML = document.querySelector(name).innerHTML || '';
            }

            /**
             * Renders the custom component by inserting HTML, CSS, and JS into the shadow DOM.
             */
            render() {                
                this.attachShadow({ mode: 'open' });

                // HTML
                this.shadowRoot.innerHTML = this.html || '';

                // CSS
                let link = document.createElement('link');
                link.setAttribute('rel', 'stylesheet');
                link.setAttribute('href', './lib/normalize.css');
                this.shadowRoot.appendChild(link);

                const styleSheets = new CSSStyleSheet();
                styleSheets.replaceSync(
                    `
                    [ngFor] {
                        display: none !important;
                    }
                    ${this.css}
                    `
                );
                this.shadowRoot.adoptedStyleSheets = [styleSheets];

                // JS
                const script = document.createElement('script');
                script.textContent = `
                    (async () => {
                        const document = window.document.querySelector("${name}").shadowRoot;
                        ${this.js}
                        Router.handleLinks();
                    })();
                `;

                this.shadowRoot.append(script);
            }
        }

        // Define the custom web component
        customElements.define(name, CustomComponent);
    }
    
    return {
        register: register
    }
})();
