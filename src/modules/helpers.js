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

var _getElementHref = function (current) {
    if (current) {
        if (current.nodeName.toLowerCase() === 'a') {
            return current.getAttribute('href');
        } else if (current.nodeName.toLowerCase() === 'body') {
            return false;
        } else {
            return _getElementHref(current.parentNode);
        }
    } else {
        return false;
    }
};

helpers.createConsentClickListener = function () {
    window.onclick = function (e) {
        e = e || window.event;
        var t = e.target || e.srcElement;

        // Listen to all links except for the OPT OUT link (do not-redirect, go to opt-out url)
        if (t.id === configGeneral.consent.consentLinkId) {
            return true;
        }

        var possibleHref = _getElementHref(t);
        if (possibleHref) {
            window.location = configGeneral.urls.digitrustRedirect + '?redirect=' + encodeURIComponent(possibleHref);
            return false;
        }
    };
};

helpers.createPageViewClickListener = function () {
    window.onclick = function (e) {
        e = e || window.event;
        var t = e.target || e.srcElement;

        var possibleHref = _getElementHref(t);
        if (possibleHref) {
            helpers.MinPubSub.publish('DigiTrust.pubsub.app.event.pageView', []);
        }
    };
};

helpers.generateUserId = function () {
    var id = '';
    var buffer = new Uint32Array(2);
    var _getCryptoLib = function () {
        var cryptoLib;
        if (typeof crypto !== 'undefined') {
            cryptoLib = crypto;
        } else if (typeof msCrypto !== 'undefined') {
            cryptoLib = msCrypto;
        } else {
            throw new Error('[DigiTrust] Browser missing Web Cryptography library');
        }
        return cryptoLib;
    };

    _getCryptoLib().getRandomValues(buffer);
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

helpers.getObjectByKeyFromArray = function (items, key, value) {
    for (var i = 0; i < items.length; i++) {
        if (items[i][key] === value) {
            return items[i];
        }
    }
    return null;
};

helpers.getObjectByKeyFromObject = function (items, key, value) {
    for (var itemKey in items) {
        if (items[itemKey][key] === value) {
            return items[itemKey];
        }
    }
    return null;
};

helpers.getUrlParameterByName = function (name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);

    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

helpers.isIE = function  () {
    var myNav = navigator.userAgent.toLowerCase();
    return (myNav.indexOf('msie') !== -1) ? parseInt(myNav.split('msie')[1]) : false;
};

helpers.getRollbar = function (callback) {
    var rollbarConfig = {
        accessToken: 'c8b18213935a43c59f7b18dca677fd65',
        captureUncaught: true,
        payload: {
            environment: env,
        }
    };

    var Rollbar = require('rollbar-browser').init(rollbarConfig);
    return callback(Rollbar);
};

module.exports = helpers;
