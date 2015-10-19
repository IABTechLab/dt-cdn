'use strict';

var configGeneral = require('../config/general.json');
var helpers = require('./helpers');

var DigiTrustAdblock = {};

DigiTrustAdblock.checkElements = function () {
    // Need to wait for <body> to load
    window.onload = function () {
        var baitClass = 'pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links';
        var baitStyle = 'width: 1px !important; height: 1px !important; position: absolute !important;' +
            'left: -10000px !important; top: -1000px !important;';

        var bait = document.createElement('div');
        bait.setAttribute('class', baitClass);
        bait.setAttribute('style', baitStyle);
        var baitInDom = document.body.appendChild(bait);
        var detected = false;

        // Check elements
        if (baitInDom.offsetParent === null ||
            baitInDom.offsetHeight === 0 ||
            baitInDom.offsetLeft === 0 ||
            baitInDom.offsetTop === 0 ||
            baitInDom.offsetWidth === 0 ||
            baitInDom.clientHeight === 0 ||
            baitInDom.clientWidth === 0) {
            detected = true;
        }

        if (window.getComputedStyle !== undefined) {
            var baitTemp = window.getComputedStyle(baitInDom, null);
            if (baitTemp.getPropertyValue('display') === 'none' ||
                baitTemp.getPropertyValue('visibility') === 'hidden') {
                detected = true;
            }
        }

        // Clean up elements
        window.document.body.removeChild(baitInDom);

        if (detected) {
            helpers.MinPubSub.publish('DigiTrust.pubsub.adblockDetected', [true]);
        }
    };
};

DigiTrustAdblock.checkEndpoint = function () {

    // Call rubicon endpoint, AdBlock may block this domain
    helpers.xhr.get(configGeneral.urls.adblockCheck)
    .success(function (data, xhrObj) {
        // do nothing
    })
    .error(function (data, xhrObj) {
        // If no status, request was intercepted
        if (!xhrObj.status) {
            helpers.MinPubSub.publish('DigiTrust.pubsub.adblockDetected', [true]);
        } else {
            // do nothing
        }
    });
};

DigiTrustAdblock.checkAdblock = function () {
    DigiTrustAdblock.checkElements();
    DigiTrustAdblock.checkEndpoint();
};

module.exports = DigiTrustAdblock;
