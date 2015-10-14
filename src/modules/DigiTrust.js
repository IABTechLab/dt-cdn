'use strict';

var configErrors = require('../config/errors.json');
var configInitializeOptions = require('../config/initializeOptions.json');
var helpers = require('./helpers');
var DigiTrustPopup = require('./DigiTrustPopup');
var DigiTrustCookie = require('./DigiTrustCookie');
var DigiTrustCommunication = require('./DigiTrustCommunication');
var DigiTrustAdblock = require('./DigiTrustAdblock');

var DigiTrust = {};

DigiTrust.initialize = function (initializeOptions, initializeCallback) {

    initializeOptions = (!initializeOptions) ?
        configInitializeOptions :
        helpers.extend(configInitializeOptions, initializeOptions);

    // Verify Publisher's Member ID
    if (!initializeOptions.member || initializeOptions.member.length === 0) {
        throw new Error(configErrors.en.memberId);
    }

    // Start DigiTrust script
    DigiTrust._main(initializeOptions, function (identityResponseObject) {
        return initializeCallback(identityResponseObject);
    });
};

DigiTrust._main = function (initializeOptions, mainCallback) {

    var identityResponseObject = {
        success: true,
        identity: {}
    };

    var getUserCallback = function (err, identityObject) {
        if (err) {
            identityResponseObject.success = false;
            return mainCallback(identityResponseObject);
        } else {
            identityResponseObject.identity = identityObject;
            return mainCallback(identityResponseObject);
        }
    };

    // Create communication gateway with digitru.st iFrame
    DigiTrustCommunication.startConnection();

    // Does publisher want to check AdBlock
    if (initializeOptions.adblocker.blockContent) {
        DigiTrustAdblock.isAdblockEnabled(function (err, adblockIsEnabled) {
            if (err) {
                identityResponseObject.success = false;
                return mainCallback(identityResponseObject);
            } else {
                if (adblockIsEnabled) {
                    DigiTrustPopup.createAdblockPopup(initializeOptions);
                    identityResponseObject.success = false;
                    return mainCallback(identityResponseObject);
                } else {
                    DigiTrust.getUser(initializeOptions, getUserCallback);
                }
            }
        });
    } else {
        DigiTrust.getUser(initializeOptions, getUserCallback);
    }
};

DigiTrust.getUser = function (initializeOptions, getUserCallback) {
    /*  postMessage doesn't have a callback, so we listen for an event emitted by the
        DigiTrustCommunication module telling us that a message arrived from http://digitru.st
        and now we can complete the callback to getUser()
        */
    helpers.MinPubSub.subscribe('DigiTrust.pubsub.identity.final', function (userJSON) {
        return getUserCallback(null, userJSON);
    });

    DigiTrustCookie.getUser(initializeOptions);
};

module.exports = {
    initialize: DigiTrust.initialize,
    getUser: DigiTrust.getUser
};
