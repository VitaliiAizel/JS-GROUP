const ComponentWorker = (() => {

    function ngFor() {
        console.log('123');
    }

    function interpolate(text, data) {
        return text.replace(/{{\s*(.*?)\s*}}/g, (match, key) => {
            return data[key.trim()] || '';
        });
    }

    return {
        ngFor: ngFor,
        interpolate: interpolate
    }
})();
