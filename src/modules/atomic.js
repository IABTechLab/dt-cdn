'use strict';

var window = require('global/window');

var atomic = {};

var xhr = function (type, url, data) {
    var methods = {
        success: function () {},
        error: function () {}
    };
    var XHR = window.XMLHttpRequest || ActiveXObject;
    var request = new XHR('MSXML2.XMLHTTP.3.0');
    request.open(type, url, true);
    request.withCredentials = true;
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            if (request.status >= 200 && request.status < 300) {
                methods.success.apply(methods, request);
            } else {
                methods.error.apply(methods, request);
            }
        }
    };
    request.send(data);
    var callbacks = {
        success: function (callback) {
            methods.success = callback;
            return callbacks;
        },
        error: function (callback) {
            methods.error = callback;
            return callbacks;
        }
    };

    return callbacks;
};

atomic.get = function (src) {
    return xhr('GET', src);
};

atomic.put = function (url, data) {
    return xhr('PUT', url, data);
};

atomic.post = function (url, data) {
    return xhr('POST', url, data);
};

atomic.delete = function (url) {
    return xhr('DELETE', url);
};

module.exports = atomic;
