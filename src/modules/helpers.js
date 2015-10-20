'use strict';

var env = require('../config/env.json').current;
var configGeneral = require('../config/general.json')[env];

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

xhr.get = function (url, data, async) {
    return xhrRequest('GET', url, data, async);
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

helpers.createClickListener = function () {
    window.onclick = function (e) {
        e = e || window.event;
        var t = e.target || e.srcElement;
        // Listen to all links except for the OPT OUT link
        if (t.id === configGeneral.consent.consentLinkId) {
            return true;
        }
        if (t.nodeName === 'A') {
            window.location = configGeneral.urls.digitrustRedirect;
            return false;
        }
    };
};

helpers.generateUserId = function () {
    var id = '';
    var buffer = new Uint32Array(2);

    crypto.getRandomValues(buffer);
    for (var i in buffer) {
        if (buffer.hasOwnProperty(i)) {
            id = id + buffer[i].toString(16);
        }
    }

    return id;
};

helpers.isEmpty = function (obj) {

    // null and undefined are "empty"
    if (obj === null) {
        return true;
    }

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0) {
        return false;
    }
    if (obj.length === 0) {
        return true;
    }

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
            return false;
        }
    }

    return true;
};

module.exports = helpers;
