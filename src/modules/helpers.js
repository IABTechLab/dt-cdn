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

/*\
|*|
|*|  Revision #1 - September 4, 2014
|*|
|*|  https://developer.mozilla.org/en-US/docs/Web/API/document.cookie
|*|  https://developer.mozilla.org/User:fusionchess
|*|
|*|  This framework is released under the GNU Public License, version 3 or later.
|*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
|*|
|*|  Syntaxes:
|*|
|*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
|*|  * docCookies.getItem(name)
|*|  * docCookies.removeItem(name[, path[, domain]])
|*|  * docCookies.hasItem(name)
|*|  * docCookies.keys()
|*|
\*/

helpers.cookie = {
    getItem: function (sKey) {
        if (!sKey) { return null; }
        return decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' +
            encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null;
    },
    setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
        var sExpires = '';
        if (vEnd) {
            switch (vEnd.constructor) {
                case Number:
                    sExpires = vEnd === Infinity ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT' : '; max-age=' + vEnd;
                    break;
                case String:
                    sExpires = '; expires=' + vEnd;
                    break;
                case Date:
                    sExpires = '; expires=' + vEnd.toUTCString();
                    break;
            }
        }
        document.cookie = encodeURIComponent(sKey) + '=' + encodeURIComponent(sValue) +
            sExpires + (sDomain ? '; domain=' + sDomain : '') + (sPath ? '; path=' + sPath : '') +
            (bSecure ? '; secure' : '');
        return true;
    },
    removeItem: function (sKey, sPath, sDomain) {
        if (!this.hasItem(sKey)) { return false; }
        document.cookie = encodeURIComponent(sKey) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT' +
            (sDomain ? '; domain=' + sDomain : '') + (sPath ? '; path=' + sPath : '');
        return true;
    },
    hasItem: function (sKey) {
        if (!sKey) { return false; }
        return (new RegExp('(?:^|;\\s*)' + encodeURIComponent(sKey)
            .replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\='))
            .test(document.cookie);
    },
    keys: function () {
        var aKeys = document.cookie
            .replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, '')
            .split(/\s*(?:\=[^;]*)?;\s*/);
        for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
        return aKeys;
    }
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

module.exports = helpers;
