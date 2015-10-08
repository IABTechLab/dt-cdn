'use strict';

var DigiTrustCommunication = require('./DigiTrustCommunication');
var helpers = require('./helpers');
var configGeneral = require('../config/general.json');

var _setLocalCookies = function (options) {
    helpers.cookie.setItem();

    // set as stringified JSON or set individual cookies?
};

var _getLocalCookies = function (options) {
    if (helpers.cookie.hasItem()) {
        helpers.cookie.getItem();
    }
};

var _getRemoteCookies = function (options, remoteCookieCallback) {
    // get remote cookie
    /*DigiTrustCommunication.sendMessage({}, function (response) {
        // no cookie
        if (1) {
            // show lightbox

            // redirect to digitru.st
            window.location = configGeneral.urls.digitrustRedirect;
        } else {
            // save cookie locally

            // return
            return remoteCookieCallback();
        }
    });*/
};

var DigiTrustCookie = {};

DigiTrustCookie.getUserCookies = function (options, userCookiesCallback) {
    // DigiTrustCookie module check if local cookie is fully set
    if (_getLocalCookies()) {
        return userCookiesCallback();
    } else {
        // Connect to iframe
        // DigiTrustCommunication.startConnection();

        _getRemoteCookies({}, function () {

        });
    }

    var err = false;

    var consentObject = {
        explicit: null,
        time: null
    };

    var privacyObject = {
        optouts: [],
        consent: consentObject
    };

    var identityObject = {
        id: 12345,
        privacy: privacyObject
    };

    // Sample
    /*var fullIdentityObject = {
        id: 'ei5bn38ed',
        privacy: {
            optouts: [],
            consent: {
                explicit: null,
                time: null
            }
        }
    };*/
};

module.exports = DigiTrustCookie;
