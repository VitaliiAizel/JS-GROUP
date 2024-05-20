(function (global) {
    const ajaxUtils = {};

    ajaxUtils.sendGetRequest = function (requestUrl, responseHandler, isJsonResponse) {
        const request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            handleResponse(request, responseHandler, isJsonResponse);
        };
        request.open("GET", requestUrl, true);
        request.send();
    };

    function handleResponse(request, responseHandler, isJsonResponse) {
        if ((request.readyState === 4) && (request.status === 200)) {
            if (isJsonResponse === undefined)
                isJsonResponse = true;

            if (isJsonResponse)
                responseHandler(JSON.parse(request.responseText));
            else
                responseHandler(request.responseText);
        }
    }

    global.$ajaxUtils = ajaxUtils;

})(window);