'use strict';

var config = require('./ConfigLoader');
var logObj = require('./logger');
var utilLogger = logObj.createLogger("DigiTrust_util", { level: 'ERROR' }); // default before set
var helpers = {};

var debugModeFlag = false; // flag to indicate if we are currently in debug mode
var logTagStyle = 'display: inline-block; color: #fff; background: #395BA8; padding: 1px 4px; border-radius: 3px;font-size:1.1rem;';

var dtMock = { version: 'mock version' };

helpers.setDebug = function (isSet) {
  var dt = window.DigiTrust || dtMock;
  var l = utilLogger;
  var prev = l.prevSettings || {};
  l.prevSettings = prev;
  if (debugModeFlag == isSet) {
    return;
  }
  if (isSet) {
    debugModeFlag = true;
    l.prevSettings = {
      enabled: l.enabled,
      logLevel: { level: l.opts.level }
    };

    l.enabled = true;
    l.opts.level = "DEBUG";
    // utilLogger this.opts = { level
    utilLogger.info("%cDigiTrust Debug Mode Enabled", logTagStyle);
    utilLogger.info("DigiTrust version: " + dt.version);
  }
  else {
    debugModeFlag = false;
    l.enabled = prev.enabled;
    l.logLevel = prev.logLevel;
  }
  publishLogLevelChange(l.opts.level, l.opts.enabled);
}

helpers.isDebugEnabled = function () {
  return debugModeFlag == true;
}

/**
 * Allow root object to inject global logger
 */ 
helpers.setGlobalLogger = function (logger) {
  return utilLogger = logger;
}
helpers.getGlobalLogger = function () {
  return utilLogger;
}

function publishLogLevelChange(newLevel) {
  // publish to list
}


/**
 * Extends target object with properties and functions from source.
 * Returns target object
 * 
 * @param {any} target The object to extend or null to generate a new object
 * @param {any} source Source object to copy properties from
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

var defaultLogConfig = { level: 'ERROR', enable: false }

/**
 * Creates a logger based upon the global library settings
 * @param {string} logId Identifier that will output to log
 */
function createLogger(logId) {
  var logId = logId || 'DigiTrust_default'
  if (window && window.DigiTrust && window.DigiTrust._config) {
    var newLogger = null;
    var logConf = DigiTrust._config.getConfig().getValue("logging")
    if (logConf == null) {
      newLogger = logObj.createLogger(logId, defaultLogConfig);
    }
    else {
      if (logConf.enable == false) {
        // disable logging
        newLogger = logObj.createLogger(logId, { level: 'ERROR' });
        newLogger.enabled = false;
      }
      else {
        if (logConf.level == null) {
          logConf.level = "ERROR";
        }
        newLogger = logObj.createLogger(logId, logConf);
        newLogger.enabled = logConf.enable == true || logConf.enabled == true || false;
      }
    }

    return newLogger;
  }
  else {
    return logObj.createLogger(logId, defaultLogConfig);
  }
}

/**
 * Wrapper to access config singleton without every object requiring it.
 * */
function getConfig() {
  if (window && window.DigiTrust && window.DigiTrust._config) {
    return window.DigiTrust._config.getConfig();
  }
  // if not on global return new instance
  return config;
}

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
  var evtWrap = function (evt) {
    if (isFunc(handler)) {
      handler.call(null, evt);
    }
  };
  elem.addEventListener(eventName, evtWrap);

  return evtWrap; // return reference so we can clean up later
}

/**
 * 
 * @param {any} elem
 * @param {any} eventName
 * @param {any} handler The function (or wrapper ref) to the handler
 */
var nixEvt = function (elem, eventName, handler) {
  if (elem && elem.removeEventListener) {
    elem.removeEventListener(eventName, handler);
  }
}

/*
*   https://github.com/toddmotto/atomic
*   MIT
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

xhr.promise = function (method, url, data) {
    return xhrPromise(method, url, data);
};

helpers.xhr = xhr;

var _getElementHref = function (current) {
    if (current) {
        if (current.nodeName.toLowerCase() === 'a') {
            return current.href;
        } else if (current.nodeName.toLowerCase() === 'body') {
            return false;
        } else {
            return _getElementHref(current.parentNode);
        }
    } else {
        return false;
    }
};

helpers.getConfig = getConfig;

helpers.createLogger = createLogger;

helpers.getAbsolutePath = function (href) {
    var link = document.createElement('a');
    link.href = href;
    return link.cloneNode(false).href;
};

/*
 * Test to see if we are in an iFrame safely
 */ 
var inIframe = function () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
};

/*
 * Encapsulate storing flags for redirect control.
 * 
 */
var flagStore = {
  _settings: {
    key: null,
    expire: {
      val: 7,
      per: 'd'
    },
    expirePeriods: {
      'd': 24,
      'h': 1,
      'm': (1 / 60),
      's': (1/3600)
    },
    checkLoad: function () {
      var s = flagStore['_settings'];
      if (s.key != null) {
        return true;
      }
      var opt = getConfig(),
        rd = opt.redirectInterval || {};
      s.key = rd.key || 'DigiTrust.v1.redir';
      if (rd.exp) {
        s.expire.val = rd.exp;
      }
      if (rd.experiod) {
        s.expire.per = rd.experiod;
      }
    }
  },
  getStore: function () {
    flagStore._settings.checkLoad();
    return window.localStorage;
    // return window.sessionStorage;
  },
  ignoreRedirect: function () {
    var store = flagStore.getStore();
    var s = flagStore._settings;
    var tmp = store.getItem(s.key);
    if (tmp == null) {
      return false;
    }
    try {
      var obj = JSON.parse(tmp);
      var ts = new Date(obj.exp);
      var expFactor = s.expirePeriods[s.expire.per] || 24;
      var expVal = s.expire.val * expFactor;

      var isExpired = (ts.setHours(expVal) <= new Date().getTime());
      if (isExpired) {
        flagStore.clearRedirectFlag();
        return false;
      }
      return true;
    }
    catch (ex) {
      flagStore.clearRedirectFlag();
      return false;
    }
  },
  clearRedirectFlag: function () {
    var store = flagStore.getStore();
    var key = flagStore._settings.key;
    store.removeItem(key);
  },
  clearAll: function () {
    flagStore.clearRedirectFlag();
  },
  setRedirectFlag: function () {
    var store = flagStore.getStore();
    var key = flagStore._settings.key;
    var obj = {
      val: true,
      exp: new Date().getTime()
    };
    store.setItem(key, JSON.stringify(obj));
  }
}

helpers.resetFlags = function () {
  flagStore.clearAll();
}

/**
 * @function
 * Builds a consent click handler
 * */
helpers.createConsentClickListener = function () {
  if (inIframe()) {
    return;
  }

  if (flagStore.ignoreRedirect()) {
    return;
  }

  var handlerRef;

  var consentClickHandler = function (e) {
    e = e || window.event;
    var t = e.target || e.srcElement;
    var consentLinkId = "digitrust-optout";

    // Listen to all links except for the OPT OUT link (do not-redirect, go to opt-out url)
    if (t.id === consentLinkId) {
      return true;
    }

    var possibleHref = _getElementHref(t) || '';
    var posA = possibleHref.indexOf('http://'),
      posB = possibleHref.indexOf('https://'),
      isLink = posA == 0 || posB == 0;
    if (isLink) {
      // remove consentClick link handler after we attempt
      nixEvt(window, 'click', handlerRef);
      flagStore.setRedirectFlag();
      window.location = config.getValue('urls.digitrustRedirect') + '?redirect=' + encodeURIComponent(possibleHref);
      return false;
    }
  };

  handlerRef = addEvt(window, 'click', consentClickHandler)

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


helpers.deepGet = function (obj, key) {
  var type = typeof (obj);
  if (type != 'object' || helpers.isEmpty(obj) || key == null) {
    return null;
  }

  var i, val = obj, k;
  var parts = key.split('.');
  var max = parts.length;

  for (i = 0; i < max; i++) {
    k = parts[i];
    val = val[k];
    if (i == max - 1 || val == null) {
      return val;
    }
  }

  return null;
}

helpers.getUrlParameterByName = function (name, search) {
  var search = search || location.search;
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(search);

  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

/**
 * Sniffs UserAgent for older IE.
 * @param {any} ua
 */
helpers.isIE = function (ua) {
  var ua = ua || navigator.userAgent;
  ua = ua.toLowerCase();
  var num = Math.max(ua.indexOf('msie'), ua.indexOf('trident'));
  return (num > -1) ? true : false;
};

helpers.isSafari = function (ua) {
  var ua = ua || navigator.userAgent;
  ua = ua.toLowerCase();
  if (ua.indexOf('safari') !== -1) {
    if (ua.indexOf('chrome') > -1) {
      return false;
    } else {
      return true;
    }
  }
  return false;
};

helpers.isChrome = function (ua) {
  var ua = ua || navigator.userAgent;
  ua = ua.toLowerCase();
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
