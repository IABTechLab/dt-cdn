'use strict';

var env = require('../config/env.json').current;
var configGeneral = require('../config/general.json')[env];
var DigiTrustCommunication = require('./DigiTrustCommunication');
var DigiTrustPopup = require('./DigiTrustPopup');
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

    if (!hasUserId || userJSON.id.length < 1) {
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
DigiTrustCookie.showCookieConsentPopup = true;
DigiTrustCookie.getIdentityCookieJSON = function (cookieKey) {
    var localUserCookie = DigiTrustCookie.getCookieByName(cookieKey);

    if (localUserCookie) {
        var localUserCookieJSON = DigiTrustCookie.unobfuscateCookieValue(localUserCookie);
        if (_verifyUserCookieStructure(localUserCookieJSON)) {
            return localUserCookieJSON;
        } else {
            return {};
        }
    } else {
        return {};
    }
};

DigiTrustCookie.setDigitrustCookie = function (cookieV) {
    var cookieKV = configGeneral.cookie.digitrust.userObjectKey + '=' + cookieV + ';';
    var expiresKV = 'expires=' + _maxAgeToDate(configGeneral.cookie.digitrust.maxAgeMiliseconds) + ';';
    var domainKV = configGeneral.cookie.digitrust.domainKeyValue;
    var pathKV = configGeneral.cookie.digitrust.pathKeyValue;

    _setCookie(cookieKV, expiresKV, domainKV, pathKV);
};

DigiTrustCookie.getUser = function (initializeOptions) {

    helpers.MinPubSub.subscribe('DigiTrust.pubsub.identity.response', function (userJSON) {
        if (_verifyUserCookieStructure(userJSON)) {
            var cookieStringEncoded = DigiTrustCookie.obfuscateCookieValue(userJSON);
            _setIdentityCookie(cookieStringEncoded);
            helpers.MinPubSub.publish('DigiTrust.pubsub.identity.final', [userJSON]);
        } else {
            /*
                No DigiTrust cookie exists on digitru.st domain
            */
            if (DigiTrustCookie.showCookieConsentPopup) {
                DigiTrustPopup.createConsentPopup(initializeOptions);
                helpers.createClickListener();
            } else {
                helpers.MinPubSub.publish('DigiTrust.pubsub.identity.final', [null]);
            }
        }
    });

    /*
        Only update publisher cookie, do not return anywhere
    */
    helpers.MinPubSub.subscribe('DigiTrust.pubsub.identity.response.syncOnly', function (userJSON) {
        if (_verifyUserCookieStructure(userJSON)) {
            var cookieStringEncoded = DigiTrustCookie.obfuscateCookieValue(userJSON);
            _setIdentityCookie(cookieStringEncoded);
        }
    });

    var localUserCookieJSON = DigiTrustCookie.getIdentityCookieJSON(configGeneral.cookie.publisher.userObjectKey);
    if (!helpers.isEmpty(localUserCookieJSON)) {
        // OK to proceed & show content
        helpers.MinPubSub.publish('DigiTrust.pubsub.identity.final', [localUserCookieJSON]);
        // Grab remote cookie & update local
        DigiTrustCommunication.getIdentity({syncOnly:true});
    } else {
        // Connect to iframe to check remote cookies
        DigiTrustCommunication.getIdentity();
    }
};

DigiTrustCookie.setOptout = function (optoutValue) {
    optoutValue = optoutValue ? true : false;
    var cookieConfig = window.DigiTrust.isClient ? configGeneral.cookie.publisher : configGeneral.cookie.digitrust;
    var identityCookieJSON = DigiTrustCookie.getIdentityCookieJSON(cookieConfig.userObjectKey);

    if (helpers.isEmpty(identityCookieJSON)) {
        identityCookieJSON.id = helpers.generateUserId();
    }

    identityCookieJSON.privacy = {
        optout: optoutValue
    };

    // If opting in, set consent time
    if (optoutValue === false) {
        identityCookieJSON.privacy.consent = {
            time: (new Date()).getTime()
        };
    }

    var cookieStringEncoded = DigiTrustCookie.obfuscateCookieValue(identityCookieJSON);
    _setIdentityCookie(cookieStringEncoded);
};

DigiTrustCookie.obfuscateCookieValue = function (value) {
    return btoa(JSON.stringify(value));
};
DigiTrustCookie.unobfuscateCookieValue = function (value) {
    return JSON.parse(atob(value));
};

DigiTrustCookie.getCookieByName = function (name) {
    var value = '; ' + document.cookie;
    var parts = value.split('; ' + name + '=');
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
};

module.exports = DigiTrustCookie;
