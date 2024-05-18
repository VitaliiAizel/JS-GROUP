const Router = (() => {
    function findAllShadowRoots() {
        const shadowRoots = [];
    
        function traverse(element) {
            if (element.shadowRoot) {
                shadowRoots.push(element.shadowRoot);
            }

            element.childNodes.forEach(child => traverse(child));
        }
    
        traverse(document);
    
        return shadowRoots;
    }

    function findComponent(routeName) {
        const route = window.AvailableRoutes.find((val) => val.route === routeName);
        if (route) {
            return route.component;
        }

        const defaultPage = window.AvailableRoutes.find((val) => val.route === '**');
        if (defaultPage) {
            return defaultPage.component;
        }

        return null;
    }

    function updateActiveRouterLinks(routerLinkActive) {
        const elements = document.querySelectorAll('[routerLinkActive]');

        for (const el of elements) {
            const togglingClass = el.getAttribute('routerLinkActive');
            el.classList.remove(togglingClass);
        }

        const links = routerLinkActive.split('/');
        for (let i = 0; i < links.length; i++) {
            const activeElements = document.querySelectorAll(`[routerLink="${links.slice(0, i + 1).join('/')}"]`);

            for (const el of activeElements) {
                const togglingClass = el.getAttribute('routerLinkActive');
                el.classList.add(togglingClass || 'active');
            }
    
        }
    }
    
    const eventListeners = new Map();
    function updateRouterLinks() {
        const roots = [document, ...findAllShadowRoots()];

        for (let doc of roots) {
            const routeElements = doc.querySelectorAll(`[routerLink]`);

            for (const el of routeElements) {
                const existingRedirect = eventListeners.get(el);
                if (existingRedirect) {
                    el.removeEventListener("click", existingRedirect);
                }
        
                const routerLink = el.getAttribute('routerLink');
                
                const redirect = (event) => {
                    event.preventDefault();
                    loadComponent(routerLink);

                    const params = el.getAttribute("routerParams");
                    const obj = {};
                    if (params) {
                        const pairs = params.slice(1, -1).split(",");
                        pairs.forEach(pair => {
                            const [key, value] = pair.split(':').map(str => str.trim());
                            obj[key] = value;
                        });
                    }
                    window.routerParams = obj;
                };
    
                el.addEventListener("click", redirect);
                eventListeners.set(el, redirect);
    
                const _href = el.getAttribute("href");
                if (!_href) {
                    el.setAttribute("href", routerLink);
                }
            }
        }
    }

    function handleLinks() {
        updateActiveRouterLinks(window.currentPage);
        updateRouterLinks();
    }

    async function loadComponent(route) {
        if (!window.AvailableRoutes) {
            console.error('Cant find AvailableRoutes');
            return;
        }

        const routerOutlet = document.querySelector('router-outlet');
        if (!routerOutlet) {
            console.error('Cant find router-outlet');
            return;
        }

        const component = findComponent(route);
        if (!component) {
            console.error(`Cant find component for route - ${route}`);
            return;
        }

        window.currentPage = route;
        routerOutlet.innerHTML = `<${component}></${component}>`;

        handleLinks();
    }

    return {
        loadComponent: loadComponent,
        handleLinks: handleLinks
    }
})();
