'use strict';

//var env = require('../config/env.json').current;
//var configGeneral = require('../config/general.json')[env];
var config = require('./ConfigLoader');
var Dcom = require('./DigiTrustCommunication');
var helpers = require('./helpers');

var DigiTrust = window.DigiTrust || {};


var _maxAgeToDate = function (milliseconds) {
  var date = new Date();
  date.setTime(date.getTime() + milliseconds);
  return date.toUTCString();
};

var _setCookie = function (cookieKV, expiresKV, domainKV, pathKV) {
  var str = cookieKV + expiresKV + domainKV + pathKV;
  if (str.substr(str.length - 1) != ';') {
    str += ';'
  }
  str += "SameSite=none;";
  document.cookie = str;
};

var _setIdentityCookie = function (cookieV) {

  var cookieConfig = window.DigiTrust.isClient ? config.getValue('cookie.publisher') : config.getValue('cookie.digitrust');

  var cookieKV = cookieConfig.userObjectKey + '=' + cookieV + ';';
  var expiresKV = 'expires=' + _maxAgeToDate(cookieConfig.maxAgeMiliseconds) + ';';
  var domainKV = cookieConfig.domainKeyValue;
  var pathKV = cookieConfig.pathKeyValue;

  _setCookie(cookieKV, expiresKV, domainKV, pathKV);
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
DigiTrustCookie.getIdentityCookieJSON = function (cookieKey) {
  var cookieKey = cookieKey || config.getValue('cookie.digitrust.userObjectKey');
  var localUserCookie = DigiTrustCookie.getCookieByName(cookieKey);

  if (localUserCookie) {
    var localUserCookieJSON = {};
    try {
      localUserCookieJSON = DigiTrustCookie.unobfuscateCookieValue(localUserCookie);
    } catch (e) {
      localUserCookieJSON = {
        id: helpers.generateUserId(),
        version: config.getValue('cookie.version'),
        producer: config.getValue('cookie.producer'),
        privacy: {
          optout: false
        }
      };
      _setIdentityCookie(DigiTrustCookie.obfuscateCookieValue(localUserCookieJSON));
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

DigiTrustCookie.setResetCookie = function () {
  var cookieConf = config.getValue('cookie');
  var cookieKV = cookieConf.digitrust.resetKey + '=true;';
  var expiresKV = 'expires=' + _maxAgeToDate(cookieConf.digitrust.maxAgeMiliseconds) + ';';
  var domainKV = cookieConf.digitrust.domainKeyValue;
  var pathKV = cookieConf.digitrust.pathKeyValue;

  _setCookie(cookieKV, expiresKV, domainKV, pathKV);
};

/**
 * Expires a cookie such that any subsequent page loads the cookie will not be present.
 * The original cookie exists until the page is reloaded.
 * @param {any} cookieKey
 */
DigiTrustCookie.expireCookie = function (cookieKey) {
  var cookieConf = config.getValue('cookie');

  var cookieKV = cookieKey + '=; ',
    expiresKV = 'expires=expires=Thu, 01 Jan 1970 00:00:01 GMT;',
    domainKV = '',
    pathKV = cookieConf.digitrust.pathKeyValue;

  try {
    if (location.host.indexOf(cookieConf.digitrust.domainKeyValue) > -1) {
      domainKV = cookieConf.digitrust.domainKeyValue;
    }
  }
  catch (ex) { }

  _setCookie(cookieKV, expiresKV, domainKV, pathKV);
};

DigiTrustCookie.setDigitrustCookie = function (cookieV) {
  var cookieConf = config.getValue('cookie');
  var cookieKV = cookieConf.digitrust.userObjectKey + '=' + cookieV + ';';
  var expiresKV = 'expires=' + _maxAgeToDate(cookieConf.digitrust.maxAgeMiliseconds) + ';';
  var domainKV = cookieConf.digitrust.domainKeyValue;
  var pathKV = cookieConf.digitrust.pathKeyValue;

  _setCookie(cookieKV, expiresKV, domainKV, pathKV);
};

DigiTrustCookie.getUser = function (options, callback) {
  var cookieConf = config.getValue('cookie');

  options = options || {};
  var useCallback = (typeof callback === 'function') ? true : false;
  var localUserCookieJSON = {};
  var _createSyncOnlySubscription = function () {
    // LISTENER: Only update publisher cookie, do not return anywhere
    Dcom.listen(Dcom.MsgKey.idSync, function (userJSON) { // 'DigiTrust.pubsub.identity.response.syncOnly'
      if (DigiTrustCookie.verifyPublisherDomainCookie(userJSON)) {
        var cookieStringEncoded = DigiTrustCookie.obfuscateCookieValue(userJSON);
        _setIdentityCookie(cookieStringEncoded);
      }
    });
  };

  if (useCallback === false) {
    localUserCookieJSON = DigiTrustCookie.getIdentityCookieJSON(cookieConf.publisher.userObjectKey);
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
        var cookieStringEncoded = DigiTrustCookie.obfuscateCookieValue(userJSON);
        _setIdentityCookie(cookieStringEncoded);
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
      localUserCookieJSON = DigiTrustCookie.getIdentityCookieJSON(
        cookieConf.publisher.userObjectKey
      );
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

DigiTrustCookie.obfuscateCookieValue = function (value) {
  return encodeURIComponent(btoa(JSON.stringify(value)));
};
DigiTrustCookie.unobfuscateCookieValue = function (value) {
  return JSON.parse(atob(decodeURIComponent(value)));
};

DigiTrustCookie.getCookieByName = function (name) {
  var value = '; ' + document.cookie;
  var parts = value.split('; ' + name + '=');
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
};

DigiTrustCookie.createUserCookiesOnDigitrustDomain = function () {
  var cookieConf = config.getValue('cookie');

  var userId = helpers.generateUserId();
  var userJSON = {
    id: userId,
    version: cookieConf.version,
    producer: cookieConf.producer,
    privacy: {
      optout: false
    }
  };
  var cookieStringEncoded = DigiTrustCookie.obfuscateCookieValue(userJSON);

  DigiTrustCookie.setDigitrustCookie(cookieStringEncoded);
  return userJSON;
};

DigiTrustCookie.verifyPublisherDomainCookie = function (userJSON) {
  if (helpers.isEmpty(userJSON) || !_verifyUserCookieStructure(userJSON)) { return false; }
  if (!userJSON.hasOwnProperty('keyv')) { return false; }

  return true;
};

module.exports = DigiTrustCookie;
