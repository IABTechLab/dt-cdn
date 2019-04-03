'use strict';

var cookieConfig = require('./cookie.dtsettings.json');
var Dcom = require('../modules/DigiTrustCommunication');
var cryptoLib = require('./cryptoLib');
var util = require('./frameUtils');
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

/**
 * Returns a new object literal of the user JSON
 * @param {string} userId The identifier, usually a base64 encoded string built by cryptoLib.generateUserId()
 * */ 
function newUserJson (userId) {
  var userId = userId || cryptoLib.generateUserId();
  return {
    id: userId,
    version: cookieConfig.version,
    producer: cookieConfig.producer,
    privacy: {
      optout: false
    }
  };
}

/*
 * Internal function that obtains an existing identity or initializes an identity.
 * */
function getOrInitIdentity () {
  var userCookie = getCookieValue(cookieConfig.userObjectKey);
  var userJson = {};

  if (userCookie) {
    try {
      userJson = jscoder.unobfuscateCookieValue(userCookie);
    } catch (e) {
      userJson = newUserJson();
      setIdentityCookie(jscoder.obfuscateCookieValue(userJson));
    }
  }
  else {
    userJson = newUserJson();
    setIdentityCookie(jscoder.obfuscateCookieValue(userJson));
  }

  if (_verifyUserCookieStructure(userJson)) {
    return userJson;
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

// only from publisher domain
// TODO: REMOVE
DigiTrustCookie.verifyPublisherDomainCookie = function (userJSON) {
  if (util.isEmpty(userJSON) || !_verifyUserCookieStructure(userJSON)) { return false; }
  if (!userJSON.hasOwnProperty('keyv')) { return false; }

  return true;
};

module.exports = DigiTrustCookie;
