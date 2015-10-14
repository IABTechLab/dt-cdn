'use strict';

var configGeneral = require('../config/general.json');
var helpers = require('./helpers');

var DigiTrustAdblock = {};

DigiTrustAdblock.isAdblockEnabled = function (callback) {

    var url = configGeneral.urls.adblockCheck;

    // Call rubicon endpoint, AdBlock should block this domain
    helpers.xhr.get(url)
    .success(function (data, xhrObj) {
        return callback(null, false);
    })
    .error(function (data, xhrObj) {
        // If no status, request was intercepted
        if (!xhrObj.status) {
            return callback(null, true);
        } else {
            return callback(null, false);
        }
    });
};

module.exports = DigiTrustAdblock;
