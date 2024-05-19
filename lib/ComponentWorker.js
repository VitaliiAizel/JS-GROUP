const ComponentWorker = (() => {
    /**
     * This function handles the ngFor directive in a custom component.
     * It iterates over elements with the specified 'ngFor' attribute and replaces them with 
     * the corresponding data items.
     *
     * @param {HTMLElement} source - The parent element where the ngFor directive is applied.
     * @param {string} name - The name of the variable to be used in the ngFor directive.
     * @param {Array} data - The array of data items to be iterated over.
     * @param {Array} child - An array of objects representing nested ngFor directives.
     */
    function ngFor(source, name, data, child) {
        if (!source ||!name ||!data) return;

        source.querySelectorAll(`[ngFor="${name}"]`).forEach((el) => {
            el.outerHTML = proceedNgFor(el, name, data, child);
        });

        Router.handleLinks();
    }

    /**
     * This function is a helper function for the ngFor directive. It processes the ngFor directive 
     * and replaces the corresponding elements with the iterated data items.
     *
     * @param {HTMLElement} component - The parent element where the ngFor directive is applied.
     * @param {string} name - The name of the variable to be used in the ngFor directive.
     * @param {Array} data - The array of data items to be iterated over.
     * @param {Array} child - An array of objects representing nested ngFor directives.
     * @returns {string} - The processed HTML string with the ngFor directive replaced by the iterated data items.
     */
    function proceedNgFor(component, name, data, child) {
        // Check if name and data are provided, if not return the original HTML of the component
        if (!name ||!data) return component.outerHTML;

        // Remove the ngFor attribute from the component
        component.removeAttribute("ngFor");

        // Iterate over the data array and replace the component's HTML with the iterated data items
        return data.map((item) => {
            let tmp = interpolationHelper(component.outerHTML || component, name, item);

            // If there are nested ngFor directives, process them recursively
            if (child) {
                child.forEach((c) => {
                    const doc = new DOMParser().parseFromString(tmp, "text/html");

                    // Find and replace the nested ngFor directives with the processed HTML
                    doc.querySelectorAll(`[ngFor="${c.name}"]`).forEach((el) => {
                        el.outerHTML = proceedNgFor(el, c.name, item[c.field], c.child);
                    });

                    // Update the temporary HTML with the processed nested ngFor directives
                    tmp = doc.body.innerHTML;
                });
            }

            // Return the processed HTML for the current data item
            return tmp;
        }).join('\n'); // Join the processed HTML strings with a newline character
    }

    /**
     * This function performs interpolation on a component's HTML.
     * It replaces placeholders in the component's HTML with corresponding data values.
     *
     * @param {HTMLElement} component - The parent element where the interpolation is applied.
     * @param {string|Array} name - The name of the variable to be used in the interpolation.
     *                              If an array is provided, multiple interpolations can be performed.
     * @param {Object|Array} data - The object containing the data values to be interpolated.
     *                              If an array is provided, multiple interpolations can be performed.
     *
     * @returns {void}
     *
     * @throws Will throw an error if the lengths of the 'name' and 'data' arrays are not equal.
     *
     * @example
     * // Assuming 'component' is a reference to an HTML element with the following content:
     * // <div>Hello, {{name}}!</div>
     *
     * // Performing a single interpolation
     * interpolate(component, 'name', { name: 'John' });
     * OR
     * interpolate(component, 'name', 'John');
     * // After interpolation, the component's HTML will be:
     * // <div>Hello, John!</div>
     *
     * // Performing multiple interpolations
     * interpolate(component, ['name', 'age'], { name: 'John', age: 25 });
     * OR
     * interpolate(component, ['name', 'age'], ['John', 25]);
     * // After interpolation, the component's HTML will be:
     * // <div>Hello, John! You are 25 years old.</div>
     */
    function interpolate(component, name, data) {
        const nameArr = Array.isArray(name)? name : [name];
        const dataArr = Array.isArray(data)? data : [data];

        if (nameArr.length == dataArr.length) {
            for (let i = 0; i < nameArr.length; i++) {
                const content = component.innerHTML || component;
                const replaced = interpolationHelper(content, nameArr[i], dataArr[i]);
                component.innerHTML = replaced;
            }
        } else {
            throw new Error('The lengths of the "name" and "data" arrays must be equal.');
        }
    }

    /**
     * This function is a helper function for the interpolation process. It replaces the placeholders 
     * in the component's HTML with the corresponding data values.
     *
     * @param {HTMLElement} component - The parent element where the interpolation is applied.
     * @param {string} groupName - The name of the variable to be used in the interpolation.
     * @param {Object} data - The object containing the data values to be interpolated.
     * @returns {string} - The processed HTML string with the placeholders replaced by the data values.
     */
    function interpolationHelper(component, groupName, data) {
        return component.replace(/{{(.*?)}}/g, (match, key) => {
            key = key.trim();
            
            // If the key matches the group name, return the corresponding data value
            if (key == groupName) {
                return data[key] || data || '';
            }

            // If the key starts with the group name followed by a dot, return the nested data value
            if (key.startsWith(`${groupName}.`)) {
                return data[key.slice(groupName.length + 1)] || data || '';
            }

            // If the key does not match any of the above conditions, return the original placeholder
            return match;
        });
    }

    return {
        ngFor: ngFor,
        interpolate: interpolate
    }
})();
