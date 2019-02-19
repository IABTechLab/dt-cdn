'use strict';

var cookieConfig = require('../config/cookie.json');
var Dcom = require('./DigiTrustCommunication');
var helpers = require('./helpers');

// var DigiTrust = window.DigiTrust || {};

var _maxAgeToDate = function (milliseconds) {
    var date = new Date();
    date.setTime(date.getTime() + milliseconds);
    return date.toUTCString();
};

var _setCookie = function (cookieKV, expiresKV, domainKV, pathKV) {
    document.cookie = cookieKV + expiresKV + domainKV + pathKV;
};

var _setIdentityCookie = function (cookieV) {

  var cookSettings = window.DigiTrust.isClient ? cookieConfig.publisher : cookieConfig.digitrust;

  var cookieKV = cookSettings.userObjectKey + '=' + cookieV + ';';
  var expiresKV = 'expires=' + _maxAgeToDate(cookSettings.maxAgeMiliseconds) + ';';
  var domainKV = cookSettings.domainKeyValue;
  var pathKV = cookSettings.pathKeyValue;

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

/**
 * Obtain the DigiTrust user cookie, if present
 * */
DigiTrustCookie.getUserCookie = function () {
  return DigiTrustCookie.getCookieByName(cookieConfig.digitrust.userObjectKey);
}

/**
 * Obtain the DigiTrust opt-out cookie, if present
 * */
DigiTrustCookie.getOptOut = function () {
  return DigiTrustCookie.getCookieByName(cookieConfig.digitrust.optout);
}

DigiTrustCookie.getIdentityCookieJSON = function (cookieKey) {
    var localUserCookie = DigiTrustCookie.getCookieByName(cookieKey);

    if (localUserCookie) {
        var localUserCookieJSON = {};
        try {
            localUserCookieJSON = DigiTrustCookie.unobfuscateCookieValue(localUserCookie);
        } catch (e) {
            localUserCookieJSON = {
                id: helpers.generateUserId(),
                version: cookieConfig.version,
                producer: cookieConfig.producer,
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
    var cookieKV = cookieConfig.digitrust.resetKey + '=true;';
    var expiresKV = 'expires=' + _maxAgeToDate(cookieConfig.digitrust.maxAgeMiliseconds) + ';';
    var domainKV = cookieConfig.digitrust.domainKeyValue;
    var pathKV = cookieConfig.digitrust.pathKeyValue;

    _setCookie(cookieKV, expiresKV, domainKV, pathKV);
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
    pathKV = cookieConfig.digitrust.pathKeyValue;

  try {
    if (location.host.indexOf(cookieConfig.digitrust.domainKeyValue) > -1) {
      domainKV = cookieConfig.digitrust.domainKeyValue;
    }
  }
  catch (ex) {  }

    _setCookie(cookieKV, expiresKV, domainKV, pathKV);
};

DigiTrustCookie.setDigitrustCookie = function (cookieV) {
    var cookieKV = cookieConfig.digitrust.userObjectKey + '=' + cookieV + ';';
    var expiresKV = 'expires=' + _maxAgeToDate(cookieConfig.digitrust.maxAgeMiliseconds) + ';';
    var domainKV = cookieConfig.digitrust.domainKeyValue;
    var pathKV = cookieConfig.digitrust.pathKeyValue;

    _setCookie(cookieKV, expiresKV, domainKV, pathKV);
};

DigiTrustCookie.getUser = function (options, callback) {

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
        localUserCookieJSON = DigiTrustCookie.getIdentityCookieJSON(cookieConfig.publisher.userObjectKey);
        // Do a sync with digitrust official domain
        _createSyncOnlySubscription();
        Dcom.getIdentity({syncOnly:true});
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
                cookieConfig.publisher.userObjectKey
            );
            if (DigiTrustCookie.verifyPublisherDomainCookie(localUserCookieJSON)) {
                // OK to proceed & show content
                // Grab remote cookie & update local
                _createSyncOnlySubscription();
                Dcom.getIdentity({syncOnly:true});
                return callback(false, localUserCookieJSON);
            } else {
                // Connect to iframe to check remote cookies
                Dcom.getIdentity({syncOnly:false, redirects:options.redirects});
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
	// cases occur where two cookies exist. Take the first by the name.
    if (parts.length >= 2) {
        return parts.pop().split(';').shift();
    }
};

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
