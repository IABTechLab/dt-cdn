'use strict';

var env = require('../config/env.json').current;
var configGeneral = require('../config/general.json')[env];
var configErrors = require('../config/errors.json');
var configInitializeOptions = require('../config/initializeOptions.json');
var helpers = require('./helpers');
var DigiTrustPopup = require('./DigiTrustPopup');
var DigiTrustCookie = require('./DigiTrustCookie');
var DigiTrustCommunication = require('./DigiTrustCommunication');
var DigiTrustAdblock = require('./DigiTrustAdblock');

var DigiTrust = {};
DigiTrust.options = {};
DigiTrust.isClient = false; // Is client or server?

DigiTrust.initialize = function (initializeOptions, initializeCallback) {

    var identityResponseObject = {success: false};
    var getIdentityObjectCallback = function (err, identityObject) {
        if (err || helpers.isEmpty(identityObject)) {
            return initializeCallback(identityResponseObject);
        } else {
            identityResponseObject.success = true;
            identityResponseObject.identity = identityObject;
            return initializeCallback(identityResponseObject);
        }
    };

    // Merge custom client options with default options
    DigiTrust.options = (!initializeOptions) ?
        configInitializeOptions :
        helpers.extend(configInitializeOptions, initializeOptions);

    // Verify Publisher's Member ID
    if (!DigiTrust.options.member || DigiTrust.options.member.length === 0) {
        throw new Error(configErrors.en.memberId);
    }

    // Does publisher want to check AdBlock
    if (DigiTrust.options.adblocker.blockContent) {
        DigiTrustAdblock.checkAdblock(DigiTrust.options);
        DigiTrust._getIdentityObject(getIdentityObjectCallback);

    } else {
        DigiTrust._getIdentityObject(getIdentityObjectCallback);
    }
};

DigiTrust.getUser = function (getUserOptions, callback) {

    getUserOptions = getUserOptions || {};
    var identityResponseObject = {
        success: false
    };

    // Verify Publisher's Member ID
    if (!getUserOptions.member || getUserOptions.member.length === 0) {
        throw new Error(configErrors.en.memberId);
    }

    if (getUserOptions.synchronous === true) {
        // Get publisher cookie
        var identityJSON = DigiTrustCookie.getIdentityCookieJSON(configGeneral.cookie.publisher.userObjectKey);
        if (!helpers.isEmpty(identityJSON)) {
            identityResponseObject.success = true;
            identityResponseObject.identity = identityJSON;
        }
        return identityResponseObject;
    } else {
        DigiTrustCookie.showCookieConsentPopup = false;
        DigiTrust._getIdentityObject(function (err, identityObject) {
            if (err) {
                identityResponseObject.success = false;
                return callback(identityResponseObject);
            } else {
                identityResponseObject.success = true;
                identityResponseObject.identity = identityObject;
                DigiTrustCookie.showCookieConsentPopup = true;
                return callback(identityResponseObject);
            }
        });
    }
};

DigiTrust._getIdentityObject = function (callback) {
    /*  postMessage doesn't have a callback, so we listen for an event emitted by the
        DigiTrustCommunication module telling us that a message arrived from http://digitru.st
        and now we can complete the callback
    */
    helpers.MinPubSub.subscribe('DigiTrust.pubsub.identity.final', function (userJSON) {
        var error = (!userJSON || userJSON === {}) ? true : false;
        return callback(error, userJSON);
    });

    // Create communication gateway with digitru.st iframe
    DigiTrustCommunication.startConnection(function (loadSuccess) {
        if (loadSuccess) {
            DigiTrustCookie.getUser(DigiTrust.options);
        } else {
            return callback(true);
        }
    });
};

module.exports = {
    initialize: DigiTrust.initialize,
    getUser: DigiTrust.getUser,
    setOptout: DigiTrust.setOptout
};
