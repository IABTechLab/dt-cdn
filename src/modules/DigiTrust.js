'use strict';

var configErrors = require('../config/errors.json');
var configInitializeOptions = require('../config/initializeOptions.json');
var helpers = require('./helpers');
var DigiTrustPopup = require('./DigiTrustPopup');
var DigiTrustCookie = require('./DigiTrustCookie');
var DigiTrustAdblock = require('./DigiTrustAdblock');

function _main(options, mainCallback) {

    var identityResponseObject = {
        success: true,
        identity: {}
    };

    if (options.adblocker.blockContent) {
        // Check AdBlock
        DigiTrustAdblock.isAdblockEnabled(function (adblockIsEnabled) {
            if (adblockIsEnabled) {
                DigiTrustPopup.createAdblockPopup(options);
                identityResponseObject.success = false;
                return mainCallback(identityResponseObject);
            } else {
                DigiTrustCookie.getUserCookies(options, function (err, identityObject) {
                    if (err) {
                        identityResponseObject.success = false;
                        return mainCallback(identityResponseObject);
                    } else {
                        identityResponseObject.identity = identityObject;
                        return mainCallback(identityResponseObject);
                    }
                });
            }
        });
    } else {
        DigiTrustCookie.getUserCookies(options, function (err, identityObject) {
            if (err) {
                identityResponseObject.success = false;
                return mainCallback(identityResponseObject);
            } else {
                identityResponseObject.identity = identityObject;
                return mainCallback(identityResponseObject);
            }
        });
    }
}

function initialize(options, initializeCallback) {

    options = (!options) ? configInitializeOptions : helpers.extend(configInitializeOptions, options);

    // Verify Member ID
    if (!options.member || options.member.length === 0) {
        throw new Error(configErrors.en.memberId);
    }

    _main(options, function (identityResponseObject) {
        return initializeCallback(identityResponseObject);
    });
}

function getUser(options) {

    /*DigiTrustCookie.getUserCookies(options, function (err, identityObject) {
        if (err) {
            identityResponseObject.success = false;
            return mainCallback(identityResponseObject);
        } else {
            identityResponseObject.identity = identityObject;
            return mainCallback(identityResponseObject);
        }
    });*/
}

module.exports = {
    initialize: initialize,
    getUser: getUser
};
