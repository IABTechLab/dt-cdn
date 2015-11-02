'use strict';

var configErrors = require('../config/errors.json');
var configInitializeOptions = require('../config/initializeOptions.json');
var helpers = require('./helpers');
var DigiTrustCookie = require('./DigiTrustCookie');
var DigiTrustAdblock = require('./DigiTrustAdblock');
var rollbar = require('rollbar-browser');

var DigiTrust = {};
DigiTrust.isClient = false; // Is client or server?
DigiTrust.Rollbar = false;

DigiTrust._isMemberIdValid = function (memberId) {
    if (memberId && memberId.length > 0) {
        return true;
    } else {
        console.log(configErrors.en.memberId);
        return false;
    }
};

DigiTrust.initialize = function (initializeOptions, initializeCallback) {

    try {
        var identityResponseObject = {success: false};

        // Merge custom client options with default options
        var options = (!initializeOptions) ?
            configInitializeOptions :
            helpers.extend(configInitializeOptions, initializeOptions);

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

    options = options || {};
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

module.exports = {
    initialize: DigiTrust.initialize,
    getUser: DigiTrust.getUser
};
