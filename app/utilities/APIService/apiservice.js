const host = "http://localhost:8080/";

export default class APIService {
    get(endpoint) {
        return makeRequest({ method: "GET", url: host + endpoint })
    }

    post(endpoint, body) {
        return makeRequest({ method: "POST", url: host + endpoint, params: body });
    }

    put(endpoint, body) {
        return makeRequest({ method: "PUT", url: host + endpoint, params: body });
    }

    delete(endpoint, body) {
        return makeRequest({ method: "DELETE", url: host + endpoint, params: body });
    }
}

function makeRequest(options) {
    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();

        xhr.open(options.method, options.url);

        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };

        xhr.onerror = reject;

        if (options.headers) {
            Object.keys(options.headers).forEach(function (key) {
                xhr.setRequestHeader(key, options.headers[key]);
            });
        }

        let params = options.params;

        if (options.method == "GET") {
            // We'll need to stringify if we've been given an object
            // If we have a string, this is skipped.
            if (params && typeof params === 'object') {
                params = Object.keys(params).map(function (key) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
                }).join('&');
            }
        }

        if (options.method == "POST" || options.method == "PUT" || options.method == "DELETE") {
            xhr.setRequestHeader("Content-Type", "application/json");
            if (params && typeof params === 'object') {
                params = JSON.stringify(params);
            }
        }


        console.log(params);
        xhr.send(params);
    });
}
