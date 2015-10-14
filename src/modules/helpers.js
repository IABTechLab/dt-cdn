'use strict';

var helpers = {};

helpers.extend = function (target, source) {
    target = target || {};
    for (var prop in source) {
        if (typeof source[prop] === 'object') {
            target[prop] = helpers.extend(target[prop], source[prop]);
        } else {
            target[prop] = source[prop];
        }
    }
    return target;
};

/*
*   https://github.com/toddmotto/atomic
*   MIT
*/
var parseXHR = function (req) {
    var result;
    try {
        result = JSON.parse(req.responseText);
    } catch (e) {
        result = req.responseText;
    }
    return [result, req];
};

var xhrRequest = function (type, url, data, async) {
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
                methods.success.apply(methods, parseXHR(request));
            } else {
                methods.error.apply(methods, parseXHR(request));
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

var xhr = {};

xhr.get = function (src, data, async) {
    return xhrRequest('GET', src, data, async);
};

xhr.put = function (url, data, async) {
    return xhrRequest('PUT', url, data, async);
};

xhr.post = function (url, data, async) {
    return xhrRequest('POST', url, data, async);
};

xhr.delete = function (url, data, async) {
    return xhrRequest('DELETE', url, data, async);
};

helpers.xhr = xhr;

/*
    https://github.com/daniellmb/MinPubSub
*/
var cache = window.c_ || {}; // check for 'c_' cache for unit testing
var MinPubSub = {};
MinPubSub.publish = function (topic, args) {
    var subs = cache[topic];
    var len = subs ? subs.length : 0;

    while (len--) {
        subs[len].apply(window, args || []);
    }
};

MinPubSub.subscribe = function (topic, callback) {
    if (!cache[topic]) {
        cache[topic] = [];
    }
    cache[topic].push(callback);
    return [topic, callback];
};

MinPubSub.unsubscribe = function (handle, callback) {

    var subs = cache[callback ? handle : handle[0]];
    callback = callback || handle[1];
    var len = subs ? subs.length : 0;

    while (len--) {
        if (subs[len] === callback) {
            subs.splice(len, 1);
        }
    }
};

helpers.MinPubSub = MinPubSub;

module.exports = helpers;
