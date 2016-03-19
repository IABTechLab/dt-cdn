'use strict';

var configErrors = require('../config/errors.json');
var configInitializeOptions = require('../config/initializeOptions.json');
var helpers = require('./helpers');
var DigiTrustCookie = require('./DigiTrustCookie');
var DigiTrustAdblock = require('./DigiTrustAdblock');
var DigiTrustCommunication = require('./DigiTrustCommunication');
var rollbar = require('rollbar-browser');

var DigiTrust = {};
DigiTrust.isClient = false; // Is client or server?
DigiTrust.initializeOptions = {};
DigiTrust.Rollbar = false;
DigiTrust.apps = {};
DigiTrust.currentApp = {};
DigiTrust.loadedApps = [];

DigiTrust._isMemberIdValid = function (memberId) {
    if (memberId && memberId.length > 0) {
        return true;
    } else {
        throw new Error(configErrors.en.memberId);
    }
};

DigiTrust._setDigiTrustOptions = function (options) {
    options = (!options) ?
            configInitializeOptions :
            helpers.extend(configInitializeOptions, options);
    // Set DigiTrust options on global object
    window.DigiTrust.initializeOptions = options;
    return options;
};

DigiTrust.initialize = function (options, initializeCallback) {
    try {
        var identityResponseObject = {success: false};

        options = DigiTrust._setDigiTrustOptions(options);

        // Verify Publisher's Member ID
        if (!DigiTrust._isMemberIdValid(options.member)) {
            return initializeCallback(identityResponseObject);
        }

        // Does publisher want to check AdBlock (async)
        if (options.adblocker.blockContent) {
            DigiTrustAdblock.checkAdblock(options);
        }

        DigiTrustCookie.getUser(options, function (err, identityObject) {
            if (err || helpers.isEmpty(identityObject)) {
                return initializeCallback(identityResponseObject);
            } else {
                identityResponseObject.success = true;
                identityResponseObject.identity = identityObject;
                return initializeCallback(identityResponseObject);
            }
        });
    } catch (e) {
        console.log(e);
        if (DigiTrust.Rollbar === false) {
            helpers.getRollbar(function (Rollbar) {
                DigiTrust.Rollbar = Rollbar;
                DigiTrust.Rollbar.error('Error caught DigiTrust.initialize()', e);
            });
        } else {
            DigiTrust.Rollbar.error('Error caught DigiTrust.initialize()', e);
        }

        return initializeCallback({success: false});
    }
};

DigiTrust.getUser = function (options, callback) {

    options = DigiTrust._setDigiTrustOptions(options);
    var async = (typeof callback === 'function') ? true : false;
    var identityResponseObject = {
        success: false
    };

    try {
        // Verify Publisher's Member ID
        if (!DigiTrust._isMemberIdValid(options.member)) {
            return (async === false) ? identityResponseObject : callback(identityResponseObject);
        }

        if (async === false) {
            // Get publisher cookie
            var identityJSON = DigiTrustCookie.getUser();
            if (!helpers.isEmpty(identityJSON)) {
                identityResponseObject.success = true;
                identityResponseObject.identity = identityJSON;
            }
            return identityResponseObject;
        } else {
            DigiTrustCookie.showCookieConsentPopup = false;
            options.ignoreLocalCookies = true;
            DigiTrustCookie.getUser(options, function (err, identityObject) {
                if (err) {
                    return callback(identityResponseObject);
                } else {
                    identityResponseObject.success = true;
                    identityResponseObject.identity = identityObject;
                    DigiTrustCookie.showCookieConsentPopup = true;
                    return callback(identityResponseObject);
                }
            });
        }
    } catch (e) {
        console.log(e);
        if (DigiTrust.Rollbar === false) {
            helpers.getRollbar(function (Rollbar) {
                DigiTrust.Rollbar = Rollbar;
                DigiTrust.Rollbar.error('Error caught DigiTrust.getUser()', e);
            });
        } else {
            DigiTrust.Rollbar.error('Error caught DigiTrust.getUser()', e);
        }

        return (async === false) ? identityResponseObject : callback(identityResponseObject);
    }
};

DigiTrust.addListener = function (appName, eventName, callback) {
    var _callbackArgs = function () {
        return {
            identity: DigiTrustCookie.getUser(),
            preferences: {},
            context: {
                publisher: window.DigiTrust.initializeOptions.member,
                site: window.DigiTrust.initializeOptions.site,
                url: location.href
            }
        };
    };

    var app = helpers.getObjectByKeyFromObject(window.DigiTrust.apps, 'name', appName);
    if (helpers.isEmpty(app)) {
        throw new Error(configErrors.en.appNameInvalid);
    }

    switch (eventName) {
        case 'enable':
            helpers.MinPubSub.subscribe('DigiTrust.pubsub.app.event.enable', function (pubsubAppName) {
                if (appName === pubsubAppName) {
                    callback(_callbackArgs());
                }
            });
            break;
        case 'disable':
            helpers.MinPubSub.subscribe('DigiTrust.pubsub.app.event.disable', function (pubsubAppName) {
                if (appName === pubsubAppName) {
                    callback(_callbackArgs());
                }
            });
            break;
        case 'page-view':
            helpers.MinPubSub.subscribe('DigiTrust.pubsub.app.event.pageView', function () {
                if (appName === window.DigiTrust.currentApp.name) {
                    callback(_callbackArgs());
                }
            });
            break;
    }
};


DigiTrust.sendReset = function (options, callback) {
    DigiTrustCommunication.sendReset();
};

module.exports = {
    initialize: DigiTrust.initialize,
    initializeOptions: DigiTrust.initializeOptions,
    getUser: DigiTrust.getUser,
    sendReset: DigiTrust.sendReset,
    isClient: DigiTrust.isClient,
    apps: DigiTrust.apps,
    loadedApps: DigiTrust.loadedApps,
    currentApp: DigiTrust.currentApp,
    addListener: DigiTrust.addListener
};
