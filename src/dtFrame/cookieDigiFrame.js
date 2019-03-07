'use strict';

var cookieConfig = require('./cookie.dtsettings.json');
var Dcom = require('../modules/DigiTrustCommunication');
var helpers = require('../modules/helpers');

// DigiTrust domain side cookie methods

var optoutUser = {
  "id": "",
  "privacy": {
    "optout": true
  }
};

var errorUser = {
  "error": true
};

var _maxAgeToDate = function (milliseconds) {
  var date = new Date();
  date.setTime(date.getTime() + milliseconds);
  return date.toUTCString();
};

/**
 * Set a cookie. All key/value pairs must be semi-colon terminated or empty string.
 * @param {any} cookieKV
 * @param {any} expiresKV
 * @param {any} domainKV
 * @param {any} pathKV
 */
var setCookie = function (cookieKV, expiresKV, domainKV, pathKV) {
  document.cookie = cookieKV + expiresKV + domainKV + pathKV;
};

/**
 * Get the cookie value associated with given name, or undefined.
 * @param {any} name
 */
var getCookieValue = function (name) {
  var value = '; ' + document.cookie;
  var parts = value.split('; ' + name + '=');
  // cases occur where two cookies exist. Take the first by the name.
  if (parts.length >= 2) {
    return parts.pop().split(';').shift();
  }
};


var getOrInitIdentity = function () {
  var localUserCookie = getCookieValue(cookieConfig.userObjectKey);
  var makeId = true; // (window && window.DigiTrust && !window.DigiTrust.isClient) || false; // only generate on the DigiTrust side

  if (localUserCookie) {
    var localUserCookieJSON = {};
    try {
      localUserCookieJSON = jscoder.unobfuscateCookieValue(localUserCookie);
    } catch (e) {
      if (makeId) {
        localUserCookieJSON = {
          id: helpers.generateUserId(),
          version: cookieConfig.version,
          producer: cookieConfig.producer,
          privacy: {
            optout: false
          }
        };
        setIdentityCookie(jscoder.obfuscateCookieValue(localUserCookieJSON));
      }
      else {
        localUserCookieJSON = {};
      }
    }
    if (_verifyUserCookieStructure(localUserCookieJSON)) {
      return localUserCookieJSON;
    } else {
      return {};
    }
  } else {
    return {};
  }
};

// THESE ARE IFRAME SIDE ONLY
// THESE ARE IFRAME SIDE ONLY
// THESE ARE IFRAME SIDE ONLY
// THESE ARE IFRAME SIDE ONLY
var jscoder = {
  obfuscateCookieValue: function (value) {
    return encodeURIComponent(btoa(JSON.stringify(value)));
  },

  unobfuscateCookieValue: function (value) {
    return JSON.parse(atob(decodeURIComponent(value)));
  }
}


/**
 * Set the identity cookie (as a string) with appropriate expirations.
 * @param {string} idString The encoded Identity value
 */
var setIdentityCookie = function (idString) {

  var cookSettings = cookieConfig;

  var cookieKV = cookSettings.userObjectKey + '=' + idString + ';';
  var expiresKV = 'expires=' + _maxAgeToDate(cookSettings.maxAgeMiliseconds) + ';';
  var domainKV = cookSettings.domainKeyValue;
  var pathKV = cookSettings.pathKeyValue;

  setCookie(cookieKV, expiresKV, domainKV, pathKV);
};

var _verifyUserCookieStructure = function (userJSON) {
  if (!userJSON) { return false; }

  var hasUserId = userJSON.hasOwnProperty('id');
  var hasPrivacy = userJSON.hasOwnProperty('privacy');

  if (!hasUserId || !hasPrivacy || ((!userJSON.privacy.optout) && (userJSON.id.length < 1))) {
    return false;
  }

  if (hasPrivacy) {
    var hasOptout = userJSON.privacy.hasOwnProperty('optout');
    if (!hasOptout) {
      return false;
    }
  } else {
    return false;
  }

  return true;
};

var DigiTrustCookie = {};

/**
 * Obtain the identity object from the cookie.
 * If the user has opted out this will be an empty object.
 * 
 * */
DigiTrustCookie.getUserIdentity = function () {
  return getOrInitIdentity();

}

/**
 * Obtain the DigiTrust user cookie, if present
 * */
DigiTrustCookie.getUserCookie = function () {
  return getCookieValue(cookieConfig.userObjectKey);
}

/**
 * Obtain the DigiTrust opt-out cookie, if present
 * */
DigiTrustCookie.getOptOut = function () {
  return getCookieValue(cookieConfig.optout);
}

DigiTrustCookie.setResetCookie = function () {
  var cookieKV = cookieConfig.resetKey + '=true;';
  var expiresKV = 'expires=' + _maxAgeToDate(cookieConfig.maxAgeMiliseconds) + ';';
  var domainKV = cookieConfig.domainKeyValue;
  var pathKV = cookieConfig.pathKeyValue;

  setCookie(cookieKV, expiresKV, domainKV, pathKV);
};

/**
 * Expires a cookie such that any subsequent page loads the cookie will not be present.
 * The original cookie exists until the page is reloaded.
 * @param {any} cookieKey
 */
DigiTrustCookie.expireCookie = function (cookieKey) {
  var cookieKV = cookieKey + '=; ',
    expiresKV = 'expires=expires=Thu, 01 Jan 1970 00:00:01 GMT;',
    domainKV = '',
    pathKV = cookieConfig.pathKeyValue;

  try {
    if (location.host.indexOf(cookieConfig.domainKeyValue) > -1) {
      domainKV = cookieConfig.domainKeyValue;
    }
  }
  catch (ex) { }

  setCookie(cookieKV, expiresKV, domainKV, pathKV);
};

DigiTrustCookie.setDigitrustCookie = function (cookieV) {
  var cookieKV = cookieConfig.userObjectKey + '=' + cookieV + ';';
  var expiresKV = 'expires=' + _maxAgeToDate(cookieConfig.maxAgeMiliseconds) + ';';
  var domainKV = cookieConfig.domainKeyValue;
  var pathKV = cookieConfig.pathKeyValue;

  setCookie(cookieKV, expiresKV, domainKV, pathKV);
};

/**
 * Get the User Identity from the DigiTrust frame
 * @param {any} options
 * @param {any} callback
 */
DigiTrustCookie.getUser = function (options, callback) {

  options = options || {};
  var useCallback = (typeof callback === 'function') ? true : false;
  var localUserCookieJSON = {};
  var _createSyncOnlySubscription = function () {
    // LISTENER: Only update publisher cookie, do not return anywhere
    Dcom.listen(Dcom.MsgKey.idSync, function (userJSON) { // 'DigiTrust.pubsub.identity.response.syncOnly'
      if (DigiTrustCookie.verifyPublisherDomainCookie(userJSON)) {
        var cookieStringEncoded = jscoder.obfuscateCookieValue(userJSON);
        setIdentityCookie(cookieStringEncoded);
      }
    });
  };

  if (useCallback === false) {
    localUserCookieJSON = getOrInitIdentity();
    // Do a sync with digitrust official domain
    _createSyncOnlySubscription();
    Dcom.getIdentity({ syncOnly: true });
    return (!helpers.isEmpty(localUserCookieJSON)) ? localUserCookieJSON : {};
  } else {
    /*
        postMessage doesn't have a callback, so we listen for an event emitted by the
        DigiTrustCommunication module telling us that a message arrived from http://digitru.st
        and now we can complete the callback

        LISTENER: listen for message from digitrust iframe
    */
    Dcom.listen(Dcom.MsgKey.idResp, function (userJSON) { // 'DigiTrust.pubsub.identity.response'
      if (DigiTrustCookie.verifyPublisherDomainCookie(userJSON)) {
        var cookieStringEncoded = jscoder.obfuscateCookieValue(userJSON);
        setIdentityCookie(cookieStringEncoded);
        return callback(false, userJSON);
      } else {
        // No DigiTrust cookie exists on digitru.st domain
        if (helpers.isEmpty(userJSON) && (!userJSON.hasOwnProperty('error'))) {
          if (options.redirects) {
            helpers.createConsentClickListener();
          }
        }
        return callback(true);
      }
    });

    if (options.ignoreLocalCookies === true) {
      Dcom.getIdentity();
    } else {
      localUserCookieJSON = getOrInitIdentity();
      if (DigiTrustCookie.verifyPublisherDomainCookie(localUserCookieJSON)) {
        // OK to proceed & show content
        // Grab remote cookie & update local
        _createSyncOnlySubscription();
        Dcom.getIdentity({ syncOnly: true });
        return callback(false, localUserCookieJSON);
      } else {
        // Connect to iframe to check remote cookies
        Dcom.getIdentity({ syncOnly: false, redirects: options.redirects });
      }
    }
  }
};

// Used only from iFrame
DigiTrustCookie.createUserCookiesOnDigitrustDomain = function () {
  var userId = helpers.generateUserId();
  var userJSON = {
    id: userId,
    version: cookieConfig.version,
    producer: cookieConfig.producer,
    privacy: {
      optout: false
    }
  };
  var cookieStringEncoded = jscoder.obfuscateCookieValue(userJSON);

  DigiTrustCookie.setDigitrustCookie(cookieStringEncoded);
  return userJSON;
};

// only from publisher domain
DigiTrustCookie.verifyPublisherDomainCookie = function (userJSON) {
  if (helpers.isEmpty(userJSON) || !_verifyUserCookieStructure(userJSON)) { return false; }
  if (!userJSON.hasOwnProperty('keyv')) { return false; }

  return true;
};

module.exports = DigiTrustCookie;
