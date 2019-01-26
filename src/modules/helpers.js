'use strict';

var env = require('../config/env.json').current;
var configGeneral = require('../config/general.json')[env];
var consts = require('../config/constants.json');


var helpers = {};

/**
 * Extend an object. 
 * TODO: Review if this is used and possibly remove
 * @param {any} target
 * @param {any} source
 */
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

/**
 * Tests to see if the passed object is a function
 * 
 * @param {any} fn
 */
var isFunc = function (fn) {
    if (fn != null && typeof (fn) === 'function') {
        return true;
    }

    return false;
}

/**
 * @function
 * Safely get the browser crypto library to account for IE 11
 * 
 * */
var getBrowserCrypto = function () {
    // WebKit crypto subtle
    var cryptoObj = window.crypto || window.msCrypto;

    // This is outdated and probably should be removed
    if (window.crypto && !window.crypto.subtle && window.crypto.webkitSubtle) {
        window.crypto.subtle = window.crypto.webkitSubtle;
    }

    return cryptoObj;
};

/**
 * Wrapper to attach event listeneners
 * @param {any} elem       DOM Element
 * @param {string} eventName  Name of event to attach
 * @param {function} handler  An event handler function or null
 */
var addEvt = function (elem, eventName, handler) {
    elem.addEventListener(eventName, function (evt) {
        if (isFunc(handler)) {
            handler.call(null, evt);
        }
    })
}


/*
*   https://github.com/toddmotto/atomic
*   MIT
 *   TODO: REMOVE
*/
var parseXHR = function (req) {
    var result = req.responseText;
    /*try {
        result = JSON.parse(req.responseText);
    } catch (e) {
        result = req.responseText;
    }*/
    return [result, req];
};

// TODO: Verify and remove
var xhrPromise = function (method, url, data) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.withCredentials = true;
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
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
};

// TODO: Verify and remove
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

// TODO: Verify and remove
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

xhr.promise = function (method, url, data) {
    return xhrPromise(method, url, data);
};

helpers.xhr = xhr;

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

helpers.getAbsolutePath = function (href) {
    var link = document.createElement('a');
    link.href = href;
    return link.cloneNode(false).href;
};

helpers.inIframe = function () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
};


/**
 * Tests to see if passed in parameter is a function
 * @function
 * */
helpers.isFunc = isFunc;

/**
 * @function
 * Builds a consent click handler
 * */
helpers.createConsentClickListener = function () {
    if (helpers.inIframe()) {
        return;
    }

    var consentClickHandler = function (e) {
        e = e || window.event;
        var t = e.target || e.srcElement;

        // Listen to all links except for the OPT OUT link (do not-redirect, go to opt-out url)
        if (t.id === consts.consentLinkId) {
            return true;
        }

        var possibleHref = _getElementHref(t);
        if (possibleHref && (possibleHref !== '#')) {
            possibleHref = helpers.getAbsolutePath(possibleHref);
            window.location = configGeneral.urls.digitrustRedirect + '?redirect=' + encodeURIComponent(possibleHref);
            return false;
        }
    };

    addEvt(window, 'click', consentClickHandler)

};

/**
 * @function
 * Generate a pseudo random ID for the user
 * 
 * */
helpers.generateUserId = function () {
    var buffer = new Uint8Array(8);
    
    getBrowserCrypto().getRandomValues(buffer);
    return helpers.arrayBufferToBase64String(buffer);
};

helpers.isEmpty = function (obj) {

    // null and undefined are "empty"
    if (obj === null || typeof obj === 'undefined') {
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

helpers.isSafari = function () {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('safari') !== -1) {
        if (ua.indexOf('chrome') > -1) {
            return false;
        } else {
            return true;
        }
    }
    return false;
};

helpers.isChrome = function () {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('chrome') !== -1) {
        return true;
    }
    return false;
};

helpers.isValidJSON = function (str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};

helpers.ab2str = function (buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
};

helpers.str2ab = function (str) {
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
};

helpers.arrayBufferToBase64String = function (arrayBuffer) {
    var byteArray = new Uint8Array(arrayBuffer);
    var byteString = '';
    for (var i = 0; i < byteArray.byteLength; i++) {
        byteString += String.fromCharCode(byteArray[i]);
    }
    return btoa(byteString);
};

helpers.base64StringToArrayBuffer = function (base64) {
    var binary_string =  atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
};

helpers.asciiToUint8Array = function (str) {
    var chars = [];
    for (var i = 0; i < str.length; ++i) {
        chars.push(str.charCodeAt(i));
    }
    return new Uint8Array(chars);
};

/**
* Wrapper to get the web crypto object
*
*/
helpers.getBrowserCrypto = getBrowserCrypto;


// Polyfill setup
(function(){
	
// Object.assign polyfill FROM MDN (needed for IE support)
if (typeof Object.assign != 'function') {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, "assign", {
    value: function assign(target, varArgs) { // .length of function is 2
      'use strict';
      if (target == null) { // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) { // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
}
	
	
	
})();



module.exports = helpers;
