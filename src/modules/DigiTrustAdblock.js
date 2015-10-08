'use strict';

var configGeneral = require('../config/general.json');
var helpers = require('./helpers');

var DigiTrustAdblock = {};

DigiTrustAdblock.isAdblockEnabled = function (callback) {

    var url = configGeneral.urls.adblockCheck;

    helpers.xhr.get(url)
    .success(function (data, xhrObj) {
        return callback(false);
    })
    .error(function (data, xhrObj) {
        // If no status, request was intercepted
        if (!xhrObj.status) {
            return callback(true);
        } else {
            return callback(false);
        }
    });
};

module.exports = DigiTrustAdblock;
