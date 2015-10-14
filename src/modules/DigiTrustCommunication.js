'use strict';

var configGeneral = require('../config/general.json');
var helpers = require('./helpers');

var _messageHandler = function (evt) {
    switch (evt.data.type) {
        case 'DigiTrust.iframe.ready':
            // set flag that WE ARE READY TO IFRAME

            break;
        case 'DigiTrust.identity.response':
            helpers.MinPubSub.publish('DigiTrust.pubsub.identity.response', [evt.data.value]);
            break;
    }
};

var DigiTrustCommunication = {};

DigiTrustCommunication.iframe = null;

DigiTrustCommunication.startConnection = function () {

    // Create iFrame
    DigiTrustCommunication.iframe = document.createElement('iframe');
    DigiTrustCommunication.iframe.style.display = 'none';
    DigiTrustCommunication.iframe.src = configGeneral.urls.digitrustIframe;
    document.head.appendChild(DigiTrustCommunication.iframe);

    if (window.addEventListener) {
        window.addEventListener('message', _messageHandler, false);
    } else {
        window.attachEvent('onmessage', _messageHandler);
    }
};

DigiTrustCommunication.getIdentity = function () {
    var identityRequest = {
        version: 1,
        type: 'DigiTrust.identity.request',
        id: 458776,
        value: {}
    };
    DigiTrustCommunication.iframe.contentWindow.postMessage(identityRequest, configGeneral.urls.digitrustIframe);
};

module.exports = DigiTrustCommunication;
