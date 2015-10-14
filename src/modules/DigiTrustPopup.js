'use strict';

var DigiTrustPopup = {};

DigiTrustPopup.createAdblockPopup = function (initializeOptions) {

    var div = document.createElement('div');
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.top = '0';
    div.style.left = '0';
    div.style.zIndex = 999999;
    div.style.opacity = 0.9;
    div.style.position = 'absolute';
    div.style.background = initializeOptions.adblocker.popupBackgroundColor;
    div.style.color = initializeOptions.adblocker.popupFontColor;
    div.innerHTML = initializeOptions.adblocker.userMessage;

    document.body.appendChild(div);
};

DigiTrustPopup.createConsentPopup = function (initializeOptions) {

    var div = document.createElement('div');
    div.style.width = '100%';
    div.style.padding = '10px';
    div.style.bottom = '0';
    div.style.left = '0';
    div.style.zIndex = 999999;
    div.style.position = 'fixed';
    div.style.background = initializeOptions.consent.popupBackgroundColor;
    div.style.color = initializeOptions.consent.popupFontColor;
    div.innerHTML = initializeOptions.consent.userMessage;

    document.body.appendChild(div);
};

module.exports = DigiTrustPopup;
