'use strict';

var env = require('../config/env.json').current;
var configGeneral = require('../config/general.json')[env];
var helpers = require('./helpers');
var DigiTrustPopup = require('./DigiTrustPopup');
var DigiTrustAppContainer = require('./DigiTrustAppContainer');

var DigiTrustAdblock = {};
DigiTrustAdblock.adblockDetected = false;

DigiTrustAdblock.checkElements = function () {
    // Need to wait for <body> to load
    window.onload = function () {
        // sitexw's GitHub: adblock detector
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
            DigiTrustAdblock.performIfDetected();
        }
    };
};

DigiTrustAdblock.checkEndpoint = function () {
    // Firefox adblocker throws an exception here; we do not want to abort the script (DigiTrust try/catch "returns")
    try {
        // Call rubicon endpoint, AdBlock may block this domain
        helpers.xhr.get(configGeneral.urls.adblockCheck)
        .error(function (data, xhrObj) {
            // If no status, request was intercepted
            if (!xhrObj.status) {
                DigiTrustAdblock.performIfDetected();
            } else {
                // do nothing
            }
        });
    } catch (e) {
        console.log(e);
    }
};

DigiTrustAdblock.performIfDetected = function () {

    // Since there are a few methods that can this method, there is a race to call it. Let's only execute the
    // code if its the first time we detected adblock
    if (DigiTrustAdblock.adblockDetected === false) {

        DigiTrustAdblock.adblockDetected = true;

        // If publisher has apps enabled
        if (!helpers.isEmpty(window.DigiTrust.initializeOptions.apps.manifest)) {
            DigiTrustAppContainer.launch(window.DigiTrust.initializeOptions);
        } else if (window.DigiTrust.initializeOptions.adblocker.blockContent) {
            DigiTrustPopup.createAdblockPopup(window.DigiTrust.initializeOptions, false);
        }

        if (typeof window.DigiTrust.initializeOptions.adblocker.detectedCallback === 'function') {
            try {
                window.DigiTrust.initializeOptions.adblocker.detectedCallback();
            } catch (e) {
                console.log(e);
            }
        }
    }
};

DigiTrustAdblock.checkAdblock = function (initializeOptions) {
    DigiTrustAdblock.checkElements();
    DigiTrustAdblock.checkEndpoint();
};

module.exports = {
    checkAdblock: DigiTrustAdblock.checkAdblock
};
