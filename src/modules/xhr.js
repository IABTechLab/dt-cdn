'use strict';

// var window = require('global/window');

var factory = {};

var parse = function (req) {
    var result;
    try {
        result = JSON.parse(req.responseText);
    } catch (e) {
        result = req.responseText;
    }
    return [result, req];
};

var xhr = function (type, url, data, async) {
    // if async not passed, default TRUE; if async is passed then check if truthy
    async = async ? (async ? true : false) : true;
    var methods = {
        success: function () {},
        error: function () {}
    };
    var XHR = window.XMLHttpRequest || ActiveXObject;
    var request = new XHR('MSXML2.XMLHTTP.3.0');
    request.open(type, url, async);
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            if (request.status >= 200 && request.status < 300) {
                methods.success.apply(methods, parse(request));
            } else {
                methods.error.apply(methods, parse(request));
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

factory.get = function (src, data, async) {
    return xhr('GET', src, data, async);
};

factory.put = function (url, data, async) {
    return xhr('PUT', url, data, async);
};

factory.post = function (url, data, async) {
    return xhr('POST', url, data, async);
};

factory.delete = function (url, data, async) {
    return xhr('DELETE', url, data, async);
};

module.exports = factory;
