const Router = (() => {
    /**
     * Finds a route extended data based on the given route name.
     * If the route is not found, it returns the default route.
     *
     * @param {string} routeName The name of the route to find.
     * @returns {Object|null} The found route object or null if no route is found.
     */
    function findRoute(routeName) {
        // Search for the route with the given name
        const route = window.AvailableRoutes.find((val) => val.route === routeName);
        if (route) {
            return route;
        }

        // If the route is not found, search for the default route
        const defaultPage = window.AvailableRoutes.find((val) => val.route === '**');
        if (defaultPage) {
            return defaultPage;
        }

        // If no route is found, return null
        return null;
    }

    /**
     * Prepares a component by fetching its HTML, CSS, and JavaScript files.
     * The CSS file is modified to include a 'router-outlet' class at the beginning of each rule.
     * The HTML file is updated to include the modified CSS within a <style> tag.
     *
     * @param {Object} route The route object containing the path and name of the component.
     * @param {string} route.componentPath The path to the directory containing the component files.
     * @param {string} route.componentName The name of the component.
     * @returns {Promise<Object|null>} A Promise that resolves to an object containing the prepared HTML and JavaScript files,
     * or null if any file fetching or modification fails.
     */
    async function prepareComponent(route) {
        try {
            // Fetch the HTML file
            let htmlFile = await HttpClient.getFile(`${route.componentPath}/${route.componentName}.component.html`);

            // Fetch the CSS file
            let cssFile = await HttpClient.getFile(`${route.componentPath}/${route.componentName}.component.css`);

            // Fetch the JavaScript file
            const jsFile = await HttpClient.getFile(`${route.componentPath}/${route.componentName}.component.js`);

            // Modify the CSS file to include a 'router-outlet' class at the beginning of each rule
            cssFile = cssFile.replace(/^(.*?)(?=\s*{)/gm, 'router-outlet $1');

            // Update the HTML file to include the modified CSS within a <style> tag
            htmlFile += `<style>${cssFile}</style>`;

            // Return the prepared HTML and JavaScript files
            return {
                htmlFile,
                jsFile
            };
        } catch(error) {
            // If any file fetching or modification fails, return null
            return null;
        }
    } 

    /**
     * Updates the active router links based on the given router link active.
     * It removes the toggling class from all elements with the 'routerLinkActive' attribute
     * and adds the toggling class to the elements with the 'routerLink' attribute matching the given router link active.
     *
     * @param {string} routerLinkActive - The router link active to match and add the toggling class.
     * @returns {void}
     */
    function updateActiveRouterLinks(routerLinkActive) {
        // Select all elements with the 'routerLinkActive' attribute
        const elements = document.querySelectorAll('[routerLinkActive]');

        // Loop through each element and remove the toggling class
        for (const el of elements) {
            const togglingClass = el.getAttribute('routerLinkActive');
            el.classList.remove(togglingClass);
        }

        // Select all elements with the 'routerLink' attribute matching the given router link active
        const activeElements = document.querySelectorAll(`[routerLink="${routerLinkActive}"]`);

        // Loop through each active element and add the toggling class
        for (const el of activeElements) {
            const togglingClass = el.getAttribute('routerLinkActive');
            el.classList.add(togglingClass || 'active');
        }
    }

    /**
     * Updates the router links to trigger the loadComponent function when clicked.
     * It selects all elements with the 'routerLink' attribute and attaches an onclick event listener.
     * When an element with the 'routerLink' attribute is clicked, it retrieves the router link value,
     * and calls the loadComponent function with the router link value as the parameter.
     *
     * @returns {void}
     */
    function updateRouterLinks() {
        // Select all elements with the 'routerLink' attribute
        const routeElements = document.querySelectorAll(`[routerLink]`);

        // Loop through each element
        for (const el of routeElements) {
            // Create a closure to capture the current element's router link value
            const redirect = () => {
                // Retrieve the router link value from the current element's attribute
                const routerLink = el.getAttribute('routerLink');

                // Call the loadComponent function with the router link value
                loadComponent(routerLink);
            };

            // Attach the onclick event listener to the current element
            el.onclick = redirect;
        }
    }

    /**
     * Loads a component based on the given route name.
     * It finds the route, prepares the component, and updates the router-outlet with the component's HTML and JavaScript.
     *
     * @param {string} name The name of the route to load.
     * @returns {Promise<void>} A Promise that resolves when the component is loaded, or rejects if any error occurs.
     */
    async function loadComponent(name) {
        // Check if AvailableRoutes is defined in the global scope
        if (!window.AvailableRoutes) {
            console.error('Cant find AvailableRoutes');
            return;
        }

        // Check if the route name is valid
        if (!/^[a-z]+$/i.test(name)) {
            console.error(`Invalid route name - ${name}`);
            return;
        }

        // Find the router-outlet element
        const routerOutlet = document.querySelector('router-outlet');
        if (!routerOutlet) {
            console.error('Cant find router-outlet');
            return;
        }

        // Find the route based on the given name
        const route = findRoute(name);
        if (!route) {
            console.error(`Cant find route - ${name}`);
            return;
        }

        // Prepare the component by fetching its HTML and JavaScript files
        const component = await prepareComponent(route);
        if (!component) {
            console.error(`Cant prepare html for route - ${route.route}`);
            return;
        }
        
        // Update the router-outlet with the component's HTML
        routerOutlet.innerHTML = component.htmlFile;

        // Update elements with routerLinkActive
        updateActiveRouterLinks(route.route);

        // Update binded buttons with routerLink
        updateRouterLinks();

        // Create a new script element and set its innerHTML to the component's JavaScript
        const scriptElement = document.createElement('script');
        scriptElement.innerHTML = component.jsFile;

        // Prepend the script element to the router-outlet to ensure the JavaScript is executed before other scripts
        setTimeout(() => {
            routerOutlet.prepend(scriptElement);
        }, 20);
    }

    return {
        loadComponent: loadComponent
    }

})();
