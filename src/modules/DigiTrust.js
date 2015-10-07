'use strict';

var xhr = require('./xhr');
var helpers = require('./helpers');
var errors = require('../config/errors.json');

/*
    An identity response object is
    provided in the initialize() callback.

    var identityResponseObject = {
        success: boolean,
        identity: identityObject
    };
- -
    An Identity object is the primary container for
    attributes persisted within the browser.

    var identityObject = {
        id: boolean,
        privacy: privacyObject
    };
- -
    The Privacy object includes all privacy-related
    settings attached to a given device.

    var privacyObject = {
        optouts: [],
        consent: consentObject
    };
- -
    The Consent object includes user's consent choice
    and timestamp of action.

    var consentObject = {
        explicit: boolean,
        time: long
    };
*/

var defaultInitializeOptions = {
    member: '',
    adblocker: {
        blockContent: false
    },
    consent: {
        requires: 'implicit'
    }
};

function _cookieConsentCheck(options, cookieConsentCallback) {

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

    return cookieConsentCallback(err, identityObject);
}

function _isAdblockEnabled(callback) {

    var url = 'http://anvil.rubiconproject.com/a/api/market.js?' +
        '&account_id=10438&site_id=22410&zone_id=97122&cb=oz_onValuationLoaded_97122_15&size_id=15';
    // var url = 'http://localhost:8000/fake-404-page';
    // var url = 'http://localhost:8000/cors.php';

    xhr.get(url)
    .success(function (data, xhr) {
        return callback(false);
    })
    .error(function (data, xhr) {
        // If no status, request was intercepted
        if (!xhr.status) {
            return callback(true);
        } else {
            return callback(false);
        }
    });
}

function _main(options, mainCallback) {

    var identityResponseObject = {
        success: true,
        identity: {}
    };

    if (options.adblocker.blockContent) {
        // Check AdBlock
        _isAdblockEnabled(function (adblockIsEnabled) {
            if (adblockIsEnabled) {
                identityResponseObject.success = false;
                return mainCallback(identityResponseObject);
            } else {
                _cookieConsentCheck(options, function (err, identityObject) {
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
        _cookieConsentCheck(options, function (err, identityObject) {
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

    options = (!options) ? defaultInitializeOptions : helpers.extend(defaultInitializeOptions, options);

    // Verify Member ID
    if (!options.member || options.member.length === 0) {
        throw new Error(errors.en.memberId);
    }

    _main(options, function (identityResponseObject) {
        return initializeCallback(identityResponseObject);
    });
}

function getUser(options) {
    return 12345;
}

module.exports = {
    initialize: initialize,
    getUser: getUser
};
