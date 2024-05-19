const Router = (() => {
    /**
     * Function to find all shadow roots in the document and its child nodes.
     * @returns {ShadowRoot[]} An array of all found shadow roots.
     */
    function findAllShadowRoots() {
        const shadowRoots = [];

        /**
         * Recursive function to traverse the DOM tree and collect shadow roots.
         * @param {HTMLElement} element - The current element to traverse.
         */
        function traverse(element) {
            if (element.shadowRoot) {
                shadowRoots.push(element.shadowRoot);
            }

            element.childNodes.forEach(child => traverse(child));
        }

        traverse(document);

        return shadowRoots;
    }

    /**
     * Function to find a component based on the given route name.
     * It first checks if a route with the exact name exists. If not, it looks for a default route.
     * @param {string} routeName - The name of the route to find the component for.
     * @returns {string|null} The name of the component if found, otherwise null.
     */
    function findComponent(routeName) {
        // Check if a route with the exact name exists
        const route = window.availableRoutes.find((val) => val.route === routeName);
        if (route) {
            return route.component;
        }

        // If no exact route found, check for a default route
        const defaultPage = window.availableRoutes.find((val) => val.route === '**');
        if (defaultPage) {
            return defaultPage.component;
        }

        // If no route found, return null
        return null;
    }

    /**
     * Function to update the active router links based on the current route.
     * It removes the toggling class from all router links and adds it to the active route link.
     * @param {string} routerLinkActive - The active route to highlight in the navigation menu.
     */
    function updateActiveRouterLinks(routerLinkActive) {
        // Remove the toggling class from all router links
        document.querySelectorAll('[routerLinkActive]').forEach((el) => {
            const togglingClass = el.getAttribute('routerLinkActive');
            el.classList.remove(togglingClass);
        });

        // Split the active route into individual links
        const links = routerLinkActive.split('/');

        // Iterate over each link and add the toggling class to the corresponding router link
        links.forEach((_, i) => {
            document.querySelectorAll(`[routerLink="${links.slice(0, i + 1).join('/')}"]`).forEach(el => {
                const togglingClass = el.getAttribute('routerLinkActive');
                el.classList.add(togglingClass || 'active');
            });
        });
    }
    
    /**
     * Function to update the router links with event listeners.
     * It removes existing listeners, adds new ones, and updates href attribute.
     * It also extracts and stores route parameters.
     */
    const eventListeners = new Map();
    function updateRouterLinks() {
        // Get all roots including the document and shadow roots
        const roots = [document,...findAllShadowRoots()];

        // Iterate over each root
        roots.forEach((root) => {
            // Find all elements with routerLink attribute
            root.querySelectorAll(`[routerLink]`).forEach((el) => {
                // Get existing redirect event listener
                const existingRedirect = eventListeners.get(el);
                // Remove existing listener if exists
                if (existingRedirect) el.removeEventListener("click", existingRedirect);

                // Get routerLink attribute value
                const routerLink = el.getAttribute('routerLink');

                // Define new redirect event listener
                const redirect = (event) => {
                    // Prevent default link behavior
                    event.preventDefault();
                    // Load component for the clicked route
                    loadComponent(routerLink);

                    // Extract route parameters from routerParams attribute
                    const params = el.getAttribute("routerParams");
                    const obj = {};
                    if (params) {
                        // Split params string into key-value pairs and store in object
                        params.slice(1, -1).split(",").map((pair) => {
                            const [key, value] = pair.split(':').map((str) => str.trim());
                            obj[key] = value;
                        });
                    }
                    // Store route parameters in window object
                    window.routerParams = obj;
                };

                // Add new listener to the element
                el.addEventListener("click", redirect);
                // Store new listener in eventListeners map
                eventListeners.set(el, redirect);

                // Update href attribute if not already set
                if (!el.getAttribute("href")) el.setAttribute("href", routerLink);
            });
        });
    }

    /**
     * Function to handle the navigation links.
     * It updates the active router links and router links with event listeners.
     */
    function handleLinks() {
        // Update the active router links based on the current route
        updateActiveRouterLinks(window.currentRoute);

        // Update the router links with event listeners
        updateRouterLinks();
    }

    /**
     * Function to load a component based on the given route.
     * It first checks if the required data (availableRoutes, router-outlet) is available.
     * Then it finds the component for the given route.
     * If the component is found, it updates the router-outlet with the new component.
     * Finally, its update the active router links and router links with event listeners.
     *
     * @param {string} route - The route for which the component needs to be loaded.
     */
    async function loadComponent(route) {
        // Check if availableRoutes is defined
        if (!window.availableRoutes) {
            console.error('Cant find AvailableRoutes');
            return;
        }

        // Find the router-outlet element
        const routerOutlet = document.querySelector('router-outlet');
        // Check if router-outlet is found
        if (!routerOutlet) {
            console.error('Cant find router-outlet');
            return;
        }

        // Find the component for the given route
        const component = findComponent(route);
        // Check if component is found
        if (!component) {
            console.error(`Cant find component for route - ${route}`);
            return;
        }

        // Update the current route
        window.currentRoute = route;
        // Update the router-outlet with the new component
        routerOutlet.innerHTML = `<${component}></${component}>`;

        // Call the handleLinks function to update the active router links and router links with event listeners
        handleLinks();
    }

    return {
        loadComponent: loadComponent,
        handleLinks: handleLinks
    }
})();
