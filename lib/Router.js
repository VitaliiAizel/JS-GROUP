const Router = (() => {
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

        const activeElements = document.querySelectorAll(`[routerLink="${routerLinkActive}"]`);

        for (const el of activeElements) {
            const togglingClass = el.getAttribute('routerLinkActive');
            el.classList.add(togglingClass || 'active');
        }
    }

    function updateRouterLinks() {
        const routeElements = document.querySelectorAll(`[routerLink]`);

        for (const el of routeElements) {
            const redirect = () => {
                const routerLink = el.getAttribute('routerLink');

                loadComponent(routerLink);
            };

            // TODO:
            console.log('On Click Change:');
            el.onclick = redirect;
        }
    }

    async function loadComponent(route) {
        if (!window.AvailableRoutes) {
            console.error('Cant find AvailableRoutes');
            return;
        }

        if (!/^[a-z]+$/i.test(route)) {
            console.error(`Invalid route - ${route}`);
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

        routerOutlet.innerHTML = `<${component}></${component}>`;

        updateActiveRouterLinks(route);
        updateRouterLinks();
    }

    return {
        loadComponent: loadComponent
    }
})();
