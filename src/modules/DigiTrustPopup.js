'use strict';

var env = require('../config/env.json').current;
var configGeneral = require('../config/general')[env];

var fontFamily = 'Helvetica, Arial, Veranda, sans-serif';

var DigiTrustPopup = {};

DigiTrustPopup.createAdblockPopup = function (initializeOptions) {

    var reloadDiv = document.createElement('div');
    reloadDiv.style.padding = '10px 20px';
    reloadDiv.style.margin = '20px 0 0 0';
    reloadDiv.style.textAlign = 'center';
    reloadDiv.style.display = 'inline-block';
    reloadDiv.style.borderRadius = '10px';
    reloadDiv.style.background = '#999999';
    reloadDiv.style.color = '#ffffff';
    reloadDiv.style.opacity = 1;
    reloadDiv.innerHTML = 'Reload Page';
    reloadDiv.style.cursor = 'pointer';
    reloadDiv.style.fontWeight = 'bold';
    reloadDiv.onclick = function () {
        location.reload();
    };

    var messageDiv = document.createElement('div');
    messageDiv.style.width = '50%';
    messageDiv.style.position = 'absolute';
    messageDiv.style.borderRadius = '20px';
    messageDiv.style.padding = '30px';
    messageDiv.style.top = '50%';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translate(-50%, -50%)';
    messageDiv.style.background = initializeOptions.adblocker.popupBackgroundColor;
    messageDiv.style.color = initializeOptions.adblocker.popupFontColor;
    messageDiv.style.opacity = 1;
    messageDiv.style.fontSize = '14px';
    messageDiv.style.fontFamily = fontFamily;
    messageDiv.innerHTML = '<div>' + initializeOptions.adblocker.userMessage + '</div>';
    messageDiv.appendChild(reloadDiv);

    var blurDiv = document.createElement('div');
    blurDiv.style.width = '100%';
    blurDiv.style.height = '100%';
    blurDiv.style.opacity = 0.98;
    blurDiv.style.background = '#ffffff';

    var bgDiv = document.createElement('div');
    bgDiv.style.width = '100%';
    bgDiv.style.height = '100%';
    bgDiv.style.top = '0';
    bgDiv.style.left = '0';
    bgDiv.style.zIndex = 999999;
    bgDiv.style.position = 'fixed';

    bgDiv.appendChild(blurDiv);
    bgDiv.appendChild(messageDiv);
    document.body.appendChild(bgDiv);
};

DigiTrustPopup.createConsentPopup = function (initializeOptions) {

    var optOut = document.createElement('a');
    optOut.id = 'digitrust-optout';
    optOut.innerHTML = 'You can read more or opt out of DigiTrust here.';
    optOut.style.padding = '0 0 0 10px';
    optOut.href = configGeneral.urls.optoutInfo;

    var textDiv = document.createElement('div');
    textDiv.style.padding = '5px 50px';
    textDiv.innerHTML = initializeOptions.consent.userMessage;
    textDiv.appendChild(optOut);

    var iDiv = document.createElement('div');
    iDiv.style.padding = '5px 15px';
    iDiv.style.float = 'left';
    iDiv.style.background = '#999999';
    iDiv.style.color = '#ffffff';
    iDiv.style.fontFamily = 'serif';
    iDiv.style.fontSize = '16px';
    iDiv.style.fontStyle = 'italic';
    iDiv.style.top = '0';
    iDiv.style.left = '0';
    iDiv.style.position = 'absolute';
    iDiv.style.borderBottomRightRadius = '5px';
    iDiv.innerHTML = 'i';

    var consentDiv = document.createElement('div');
    consentDiv.style.width = '100%';
    consentDiv.style.bottom = '0';
    consentDiv.style.left = '0';
    consentDiv.style.zIndex = 999998;
    consentDiv.style.position = 'fixed';
    consentDiv.style.fontFamily = fontFamily;
    consentDiv.style.fontSize = '12px';
    consentDiv.style.lineHeight = '18px';
    consentDiv.style.background = initializeOptions.consent.popupBackgroundColor;
    consentDiv.style.color = initializeOptions.consent.popupFontColor;

    consentDiv.appendChild(iDiv);
    consentDiv.appendChild(textDiv);

    document.body.appendChild(consentDiv);
};

module.exports = DigiTrustPopup;
