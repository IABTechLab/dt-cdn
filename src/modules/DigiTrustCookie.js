'use strict';

var DigiTrustCommunication = require('./DigiTrustCommunication');
var DigiTrustPopup = require('./DigiTrustPopup');
var helpers = require('./helpers');
var configGeneral = require('../config/general.json');

var _maxAgeToDate = function (milliseconds) {
    var date = new Date();
    date.setTime(date.getTime() + milliseconds);
    return date.toUTCString();
};

var _getCoookies = function () {
    return document.cookie;
};

var _setCookie = function (cookieKV, expiresKV, domainKV, pathKV) {
    document.cookie = cookieKV + expiresKV + domainKV + pathKV;
};

var _setPublisherCookie = function (cookieV) {
    var cookieKV = configGeneral.cookie.publisher.userObjectKey + '=' + cookieV + ';';
    var expiresKV = 'expires=' + _maxAgeToDate(configGeneral.cookie.publisher.maxAgeMiliseconds) + ';';
    var domainKV = configGeneral.cookie.publisher.domainKeyValue;
    var pathKV = configGeneral.cookie.publisher.pathKeyValue;

    _setCookie(cookieKV, expiresKV, domainKV, pathKV);
};

var _verifyUserCookieStructure = function (userJSON) {
    if (!userJSON) { return false; }

    var userId = userJSON.hasOwnProperty('id');
    var privacy = userJSON.hasOwnProperty('privacy');

    if (!userId) {
        return false;
    }

    if (privacy) {
        var optouts = userJSON.privacy.hasOwnProperty('optouts');
        if (!optouts) {
            return false;
        }
    } else {
        return false;
    }

    return true;
};

var DigiTrustCookie = {};

DigiTrustCookie.getUser = function (initializeOptions) {

    DigiTrustPopup.createConsentPopup(initializeOptions);

    helpers.MinPubSub.subscribe('DigiTrust.pubsub.identity.response', function (userJSON) {
        if (_verifyUserCookieStructure(userJSON)) {
            var cookieStringEncoded = DigiTrustCookie.obfuscateCookieValue(userJSON);
            _setPublisherCookie(cookieStringEncoded);
            helpers.MinPubSub.publish('DigiTrust.pubsub.identity.final', [userJSON]);
        } else {
            window.location = configGeneral.urls.digitrustRedirect;
        }
    });

    var localUserCookie = DigiTrustCookie.getCookieByName(configGeneral.cookie.digitrust.userObjectKey);

    if (localUserCookie) {
        var localUserCookieJSON = DigiTrustCookie.unobfuscateCookieValue(localUserCookie);
        if (_verifyUserCookieStructure(localUserCookieJSON)) {
            // OK
            // OK, Proceed to show content
            // OK
            // Sync with DT domain
            helpers.MinPubSub.publish('DigiTrust.pubsub.identity.final', [localUserCookieJSON]);
        } else {
            DigiTrustCommunication.getIdentity();
        }
    } else {
        // Connect to iframe to check remote cookies
        DigiTrustCommunication.getIdentity();
    }
};

// Client (Publisher) should not use this method; only http://digitru.st
DigiTrustCookie.createUserCookiesOnDigitrustDomain = function () {

    var userId = 123456;
    var userJSON = {
        id: userId,
        privacy: {
            optouts: [],
        }
    };

    var cookieString = DigiTrustCookie.obfuscateCookieValue(userJSON);
    var cookieKV = configGeneral.cookie.digitrust.userObjectKey + '=' + cookieString + ';';
    var expiresKV = 'expires=' + _maxAgeToDate(configGeneral.cookie.digitrust.maxAgeMiliseconds) + ';';
    var domainKV = configGeneral.cookie.digitrust.domainKeyValue;
    var pathKV = configGeneral.cookie.digitrust.pathKeyValue;

    // Sets cookie on http://digitru.st domain
    _setCookie(cookieKV, expiresKV, domainKV, pathKV);

    window.location = document.referrer;
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
