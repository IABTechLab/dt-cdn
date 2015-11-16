'use strict';

var env = require('../config/env.json').current;
var configGeneral = require('../config/general')[env];
var helpers = require('./helpers');

var fontFamily = 'Helvetica, Arial, Veranda, sans-serif';

var DigiTrustPopup = {};

DigiTrustPopup.createAdblockPopup = function (initializeOptions) {

    var appsDiv = document.createElement('div');
    appsDiv.id = 'digitrust-adb-apps';

    var reloadDiv = document.createElement('div');
    reloadDiv.id = 'digitrust-adb-reload';
    reloadDiv.style.padding = '10px 20px';
    reloadDiv.style.margin = '20px 0 0 0';
    reloadDiv.style.textAlign = 'center';
    reloadDiv.style.display = 'inline-block';
    reloadDiv.style.borderRadius = '10px';
    reloadDiv.style.background = '#999999';
    reloadDiv.style.color = '#ffffff';
    reloadDiv.style.textShadow = 'none';
    reloadDiv.style.opacity = 1;
    reloadDiv.innerHTML = 'Reload Page';
    reloadDiv.style.cursor = 'pointer';
    reloadDiv.style.fontWeight = 'bold';
    reloadDiv.onclick = function () {
        location.reload();
    };

    var messageDiv = document.createElement('div');
    messageDiv.id = 'digitrust-adb-message';
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
    messageDiv.style.textShadow = 'none';
    messageDiv.innerHTML = '<div>' + initializeOptions.adblocker.userMessage + '</div>';
    
    messageDiv.appendChild(reloadDiv);
    messageDiv.appendChild(appsDiv);

    var blurDiv = document.createElement('div');
    blurDiv.id = 'digitrust-adb-blur';
    blurDiv.style.width = '100%';
    blurDiv.style.height = '100%';
    blurDiv.style.opacity = 0.8;
    blurDiv.style.background = '#ffffff';

    var bgDiv = document.createElement('div');
    bgDiv.id = 'digitrust-adb-bg';
    bgDiv.style.width = '100%';
    bgDiv.style.height = '100%';
    bgDiv.style.top = '0';
    bgDiv.style.left = '0';
    bgDiv.style.zIndex = 999999;
    bgDiv.style.position = 'fixed';

    // Blur document text
    var fontColorBody = document.body.style.color;
    fontColorBody = fontColorBody || '#000000';
    document.body.style.color = 'transparent';
    document.body.style.textShadow = '0 0 7px ' + fontColorBody;

    // Blur individual elements
    var fontColor = fontColorBody;
    var allTags = document.body.getElementsByTagName('*');
    var totalTags = allTags.length;
    for (var i = 0; i < totalTags; i++) {
        // Blur text
        fontColor = document.defaultView.getComputedStyle(allTags[i], null).color;
        if (fontColor === 'rgba(0, 0, 0, 0)') {
            fontColor = fontColorBody;
        }

        allTags[i].style.color = 'transparent';
        allTags[i].style.textShadow = '0 0 7px ' + fontColor;
        // Blur images
        allTags[i].style.filter = 'blur(1px)';
        allTags[i].style.webkitFilter = 'blur(1px)';
        allTags[i].style.mozFilter = 'blur(1px)';
        allTags[i].style.msFilter = 'progid:DXImageTransform.Microsoft.Blur(PixelRadius="5");';
        allTags[i].style.oFilter = 'blur(1px)';
    }

    bgDiv.appendChild(blurDiv);
    bgDiv.appendChild(messageDiv);
    document.body.appendChild(bgDiv);
};

DigiTrustPopup.createConsentPopup = function (initializeOptions) {

    var optOut = document.createElement('a');
    optOut.id = configGeneral.consent.consentLinkId;
    optOut.innerHTML = 'You can read more or opt out of DigiTrust here.';
    optOut.style.padding = '0 0 0 10px';
    optOut.href = configGeneral.urls.optoutInfo;

    var textDiv = document.createElement('div');
    textDiv.id = 'digitrust-c-text';
    textDiv.style.padding = '5px 50px';
    textDiv.innerHTML = initializeOptions.consent.userMessage;
    textDiv.appendChild(optOut);

    var iDiv = document.createElement('div');
    iDiv.id = 'digitrust-c-info';
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

    var bgDiv = document.createElement('div');
    bgDiv.id = 'digitrust-c-bg';
    bgDiv.style.width = '100%';
    bgDiv.style.bottom = '0';
    bgDiv.style.left = '0';
    bgDiv.style.zIndex = 999998;
    bgDiv.style.position = 'fixed';
    bgDiv.style.fontFamily = fontFamily;
    bgDiv.style.fontSize = '12px';
    bgDiv.style.lineHeight = '18px';
    bgDiv.style.background = initializeOptions.consent.popupBackgroundColor;
    bgDiv.style.color = initializeOptions.consent.popupFontColor;

    bgDiv.appendChild(iDiv);
    bgDiv.appendChild(textDiv);

    document.body.appendChild(bgDiv);
};

DigiTrustPopup.createAppOptionsPopup = function (initializeOptions) {

    var bgDiv = document.createElement('div');
    bgDiv.id = 'digitrust-apps-options';
    bgDiv.style.bottom = '0';
    bgDiv.style.left = '0';
    bgDiv.style.right= '0';
    bgDiv.style.padding = '5px';
    bgDiv.style.zIndex = 999998;
    bgDiv.style.position = 'fixed';
    bgDiv.style.fontFamily = fontFamily;
    bgDiv.style.fontSize = '12px';
    bgDiv.style.lineHeight = '18px';
    bgDiv.style.background = initializeOptions.consent.popupBackgroundColor;
    bgDiv.style.color = initializeOptions.consent.popupFontColor;

    var closeDiv = document.createElement('div');
    closeDiv.id = 'digitrust-apps-options-close';
    closeDiv.innerHTML = 'x';
    closeDiv.style.cursor = 'pointer';
    closeDiv.style.position = 'absolute';
    closeDiv.style.right = '7px';
    closeDiv.style.top = '5px';
    closeDiv.style.fontWeight = 'bold';
    closeDiv.onclick = function () {
        document.getElementById('digitrust-apps-options').remove();
    };
    bgDiv.appendChild(closeDiv);

    document.body.appendChild(bgDiv);
};

DigiTrustPopup.getAppsSelectHtml = function (appsObject, defaultApp, reload) {
    var appsHTML = document.createElement('div');
    appsHTML.id = 'digitrust-apps-select-container';
    // appsHTML.style.margin = '20px 0 0 0';
    appsHTML.innerHTML = '<b>Apps available:</b><br/>';

    var appsSelectList = document.createElement("select");
    appsSelectList.id = "digitrust-apps-select";
    for (var appId in appsObject) {
        var option = document.createElement("option");
        option.value = appId;
        option.text = appsObject[appId].name;

        if (defaultApp && appsObject[appId].name === defaultApp.name) {
            option.selected = true;
        }

        appsSelectList.appendChild(option);
    }
    appsHTML.appendChild(appsSelectList);

    var setAppButton = document.createElement('button');
    setAppButton.id = 'digitrust-apps-set-app';
    setAppButton.innerHTML = 'Select';
    setAppButton.onclick = function () {
        var element = document.getElementById('digitrust-apps-select');
        var appId = element.options[element.selectedIndex].value;
        var app = window.DigiTrust.apps[appId];
        if (reload === true) {
            helpers.MinPubSub.publish('DigiTrust.pubsub.app.selected.reload', [app]);
        } else {
            helpers.MinPubSub.publish('DigiTrust.pubsub.app.selected.noreload', [app]);
        }
    };
    appsHTML.appendChild(setAppButton);

    var statusText = document.createElement("span");
    statusText.id = "digitrust-apps-select-status";
    appsHTML.appendChild(statusText);

    return appsHTML;
};

module.exports = DigiTrustPopup;
