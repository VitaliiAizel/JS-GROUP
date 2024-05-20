const HttpClient = (() => {
    const isLocal = false;
    const BASE_URL = 'https://raw.githubusercontent.com/Alexander0kd/JS-GROUP/main';

    /**
     * Performs an HTTP GET request to the specified URL.
     *
     * @param {string} url - The URL to which the GET request will be made.
     * @returns {Promise<Response>} - A Promise that resolves to the Response object.
     * @throws {Error} - If the HTTP request fails or the response status is not OK.
     */
    async function GET(url) {
        try {
            const response = await fetch(isLocal ? `${BASE_URL}/${url}` : url);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            return response;
        } catch(error) {
            console.error('From [GET] function', error);
        }
    }

    /**
     * Fetches a file from the specified URL and returns its content as a text string.
     *
     * @param {string} url - The URL of the file to fetch.
     * @returns {Promise<string>} - A Promise that resolves to the file content as a text string.
     */
    async function getFile(url) {
        const response = await GET(url);
        if (response) {
            return response.text();
        }
    }

    /**
     * Fetches a JSON file from the specified URL and returns its parsed content.
     *
     * @param {string} url - The URL of the JSON file to fetch.
     * @returns {Promise<Object>} - A Promise that resolves to the parsed JSON content.
     */
    async function getJson(url) {
        const response = await GET(url);
        if (response) {
            return response.json();
        }
    }

    return {
        getFile: getFile,
        getJson: getJson
    }
})();
