'use strict';

var env = require('../config/env.json').current;
var configGeneral = require('../config/general.json')[env];
var DigiTrustCommunication = require('./DigiTrustCommunication');
var helpers = require('./helpers');

var _maxAgeToDate = function (milliseconds) {
    var date = new Date();
    date.setTime(date.getTime() + milliseconds);
    return date.toUTCString();
};

var _setCookie = function (cookieKV, expiresKV, domainKV, pathKV) {
    document.cookie = cookieKV + expiresKV + domainKV + pathKV;
};

var _setIdentityCookie = function (cookieV) {

    var cookieConfig = window.DigiTrust.isClient ? configGeneral.cookie.publisher : configGeneral.cookie.digitrust;

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
    var localUserCookie = DigiTrustCookie.getCookieByName(cookieKey);

    if (localUserCookie) {
        var localUserCookieJSON = {};
        try {
            localUserCookieJSON = DigiTrustCookie.unobfuscateCookieValue(localUserCookie);
        } catch (e) {
            localUserCookieJSON = {
                id: helpers.generateUserId(),
                version: configGeneral.cookie.version,
                producer: configGeneral.cookie.producer,
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
    var cookieKV = configGeneral.cookie.digitrust.resetKey + '=true;';
    var expiresKV = 'expires=' + _maxAgeToDate(configGeneral.cookie.digitrust.maxAgeMiliseconds) + ';';
    var domainKV = configGeneral.cookie.digitrust.domainKeyValue;
    var pathKV = configGeneral.cookie.digitrust.pathKeyValue;

    _setCookie(cookieKV, expiresKV, domainKV, pathKV);
};

DigiTrustCookie.expireCookie = function (cookieKey) {
    var cookieKV = cookieKey + '=;';
    var expiresKV = 'expires=' + _maxAgeToDate(-10000000000000) + ';';
    var domainKV = configGeneral.cookie.digitrust.domainKeyValue;
    var pathKV = configGeneral.cookie.digitrust.pathKeyValue;

    _setCookie(cookieKV, expiresKV, domainKV, pathKV);
};

DigiTrustCookie.setAppReminderCookie = function () {
    var cookieKV = configGeneral.app.cookie.reminderObjectKey + '=1;';
    var expiresKV = 'expires=' + _maxAgeToDate(configGeneral.app.cookie.reminderMaxAgeMiliseconds) + ';';
    var domainKV = configGeneral.cookie.publisher.domainKeyValue;
    var pathKV = configGeneral.cookie.publisher.pathKeyValue;

    _setCookie(cookieKV, expiresKV, domainKV, pathKV);
};

DigiTrustCookie.setDigitrustCookie = function (cookieV) {
    var cookieKV = configGeneral.cookie.digitrust.userObjectKey + '=' + cookieV + ';';
    var expiresKV = 'expires=' + _maxAgeToDate(configGeneral.cookie.digitrust.maxAgeMiliseconds) + ';';
    var domainKV = configGeneral.cookie.digitrust.domainKeyValue;
    var pathKV = configGeneral.cookie.digitrust.pathKeyValue;

    _setCookie(cookieKV, expiresKV, domainKV, pathKV);
};

DigiTrustCookie.getUser = function (options, callback) {

    options = options || {};
    var useCallback = (typeof callback === 'function') ? true : false;
    var localUserCookieJSON = {};
    var _createSyncOnlySubscription = function () {
        // LISTENER: Only update publisher cookie, do not return anywhere
        helpers.MinPubSub.subscribe('DigiTrust.pubsub.identity.response.syncOnly', function (userJSON) {
            if (DigiTrustCookie.verifyPublisherDomainCookie(userJSON)) {
                var cookieStringEncoded = DigiTrustCookie.obfuscateCookieValue(userJSON);
                _setIdentityCookie(cookieStringEncoded);
            }
        });
    };

    if (useCallback === false) {
        localUserCookieJSON = DigiTrustCookie.getIdentityCookieJSON(configGeneral.cookie.publisher.userObjectKey);
        // Do a sync with digitrust official domain
        _createSyncOnlySubscription();
        DigiTrustCommunication.getIdentity({syncOnly:true});
        return (!helpers.isEmpty(localUserCookieJSON)) ? localUserCookieJSON : {};
    } else {
        /*
            postMessage doesn't have a callback, so we listen for an event emitted by the
            DigiTrustCommunication module telling us that a message arrived from http://digitru.st
            and now we can complete the callback

            LISTENER: listen for message from digitrust iframe
        */
        helpers.MinPubSub.subscribe('DigiTrust.pubsub.identity.response', function (userJSON) {
            if (DigiTrustCookie.verifyPublisherDomainCookie(userJSON)) {
                var cookieStringEncoded = DigiTrustCookie.obfuscateCookieValue(userJSON);
                _setIdentityCookie(cookieStringEncoded);
                return callback(false, userJSON);
            } else {
                // No DigiTrust cookie exists on digitru.st domain
                if (options.redirects) {
                    helpers.createConsentClickListener();
                }
                return callback(true);
            }
        });

        if (options.ignoreLocalCookies === true) {
            DigiTrustCommunication.getIdentity();
        } else {
            localUserCookieJSON = DigiTrustCookie.getIdentityCookieJSON(
                configGeneral.cookie.publisher.userObjectKey
            );
            if (DigiTrustCookie.verifyPublisherDomainCookie(localUserCookieJSON)) {
                // OK to proceed & show content
                // Grab remote cookie & update local
                _createSyncOnlySubscription();
                DigiTrustCommunication.getIdentity({syncOnly:true});
                return callback(false, localUserCookieJSON);
            } else {
                // Connect to iframe to check remote cookies
                DigiTrustCommunication.getIdentity({syncOnly:false, redirects:options.redirects});
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
    var userId = helpers.generateUserId();
    var userJSON = {
        id: userId,
        version: configGeneral.cookie.version,
        producer: configGeneral.cookie.producer,
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
