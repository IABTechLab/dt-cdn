'use strict';

var env = require('../config/env.json').current;
var configGeneral = require('../config/general.json')[env];
var configErrors = require('../config/errors.json');
var helpers = require('./helpers');

var DigiTrustCommunication = {};

DigiTrustCommunication.iframe = null;
DigiTrustCommunication.iframeStatus = 0; // 0: no iframe; 1: connecting; 2: ready

DigiTrustCommunication._messageHandler = function (evt) {
    if (evt.origin !== configGeneral.iframe.postMessageOrigin) {
        throw new Error(configErrors.en.postMessageOrigin);
    } else {
        switch (evt.data.type) {
            case 'DigiTrust.iframe.ready':
                helpers.MinPubSub.publish('DigiTrust.pubsub.iframe.ready', [true]);
                break;
            case 'DigiTrust.identity.response':
                helpers.MinPubSub.publish('DigiTrust.pubsub.identity.response', [evt.data.value]);
                break;
            case 'DigiTrust.identity.response.syncOnly':
                helpers.MinPubSub.publish('DigiTrust.pubsub.identity.response.syncOnly', [evt.data.value]);
                break;
            case 'DigiTrust.getAppsPreferences.response':
                helpers.MinPubSub.publish('DigiTrust.pubsub.app.getAppsPreferences.response', [evt.data.value]);
                break;
            case 'DigiTrust.setAppsPreferences.response':
                helpers.MinPubSub.publish('DigiTrust.pubsub.app.setAppsPreferences.response', [evt.data.value]);
                break;
        }
    }
};

DigiTrustCommunication.startConnection = function (loadSuccess) {
    /*
        If there is a connection problem, or if adblocker blocks the request,
        start a 10 second timeout to notify the caller. Clear the timeout upon
        successful connection to the iframe

        Note: onload is executed even on non 2XX HTTP STATUSES (e.g. 404, 500)
              for cross-domain iframe requests
    */
    var iframeLoadErrorTimeout = setTimeout(function () {
        loadSuccess(false);
        DigiTrustCommunication.iframeStatus = 0;
    }, configGeneral.iframe.timeoutDuration);

    helpers.MinPubSub.subscribe('DigiTrust.pubsub.iframe.ready', function (iframeReady) {
        clearTimeout(iframeLoadErrorTimeout);
        DigiTrustCommunication.iframeStatus = 2;
        loadSuccess(true);
    });

    // Add postMessage listeners
    if (window.addEventListener) {
        window.addEventListener('message', DigiTrustCommunication._messageHandler, false);
    } else {
        window.attachEvent('onmessage', DigiTrustCommunication._messageHandler);
    }

    DigiTrustCommunication.iframe = document.createElement('iframe');
    DigiTrustCommunication.iframe.style.display = 'none';
    DigiTrustCommunication.iframe.src = configGeneral.urls.digitrustIframe;
    DigiTrustCommunication.iframeStatus = 1;
    document.head.appendChild(DigiTrustCommunication.iframe);
};

DigiTrustCommunication.sendRequest = function (sendRequestFunction, options) {

    if (DigiTrustCommunication.iframeStatus === 2) {
        sendRequestFunction(options);
    } else if (DigiTrustCommunication.iframeStatus === 1) {
        // This mimics a "delay", until the iframe is ready
        helpers.MinPubSub.subscribe('DigiTrust.pubsub.iframe.ready', function (iframeReady) {
            sendRequestFunction(options);
        });
    } else if (DigiTrustCommunication.iframeStatus === 0) {
        // Create communication gateway with digitru.st iframe
        DigiTrustCommunication.startConnection(function (loadSuccess) {
            if (loadSuccess) {
                sendRequestFunction(options);
            } else {
                throw new Error(configErrors.en.iframeError);
            }
        });
    }
};

DigiTrustCommunication.getIdentity = function (options) {
    options = options ? options : {};
    var _sendIdentityRequest = function (options) {
        var identityRequest = {
            version: 1,
            type: 'DigiTrust.identity.request',
            syncOnly: options.syncOnly ? options.syncOnly : false,
            value: {}
        };
        DigiTrustCommunication.iframe.contentWindow.postMessage(identityRequest, DigiTrustCommunication.iframe.src);
    };

    DigiTrustCommunication.sendRequest(_sendIdentityRequest, options);
};

DigiTrustCommunication.getAppsPreferences = function (options) {
    if (!options.member) { throw new Error(configErrors.en.iframeMissingMember); }

    var _request = function (options) {
        var requestPayload = {
            version: 1,
            type: 'DigiTrust.getAppsPreferences.request',
            value: {
                member: options.member
            }
        };
        DigiTrustCommunication.iframe.contentWindow.postMessage(requestPayload, DigiTrustCommunication.iframe.src);
    };

    DigiTrustCommunication.sendRequest(_request, options);
};

DigiTrustCommunication.setAppsPreferences = function (options) {

    if (!options.member) { throw new Error(configErrors.en.iframeMissingMember); }
    if (!options.app || !options.app.name) { throw new Error(configErrors.en.iframeMissingAppName); }

    var _request = function (options) {
        var requestPayload = {
            version: 1,
            type: 'DigiTrust.setAppsPreferences.request',
            value: {
                member: options.member,
                app: options.app
            }
        };
        DigiTrustCommunication.iframe.contentWindow.postMessage(requestPayload, DigiTrustCommunication.iframe.src);
    };

    DigiTrustCommunication.sendRequest(_request, options);
};

DigiTrustCommunication.sendReset = function (options) {
    var DigiTrustCookie = require('./DigiTrustCookie');
    DigiTrustCookie.setResetCookie();
    var _request = function (options) {
        var requestPayload = {
            version: 1,
            type: 'DigiTrust.identity.reset'
        };
        DigiTrustCommunication.iframe.contentWindow.postMessage(requestPayload, DigiTrustCommunication.iframe.src);
    };

    DigiTrustCommunication.sendRequest(_request, options);
};

module.exports = {
    getIdentity: DigiTrustCommunication.getIdentity,
    startConnection: DigiTrustCommunication.startConnection,
    getAppsPreferences: DigiTrustCommunication.getAppsPreferences,
    setAppsPreferences: DigiTrustCommunication.setAppsPreferences,
    sendReset: DigiTrustCommunication.sendReset
};
