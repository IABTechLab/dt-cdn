'use strict';

var env = require('../config/env.json').current;
var configGeneral = require('../config/general.json')[env];
var configErrors = require('../config/errors.json');
var helpers = require('./helpers');

var LOGID = 'DigiTrustCommunication';
var logObj = require('./logger');
var log = logObj.createLogger(LOGID, {level: 'ERROR'}); // this will later be re-initialized if the init pass requires
var logInitialized = false;

var DigiTrustCommunication = {};


/**
* @function
* Wrapper method that merges any initialized options into the general configuration.
*/
function getConfig(){
	var opts = window.DigiTrust.initializeOptions;
	var env = opts && opts.environment;
	
	var i;
	var config = Object.assign({}, configGeneral);
	
	// go for specific items
	var keys = ['urls', 'iframe']
	
	// function to set the specific override values
	var setVals = function(target, source, key){
		try{
			var k;
			if(source[key] == null){ return; }
			if(target[key] == null){
				if(source[key] == null){ return; }
			}
			else{
				target[key] = {}
			}
			for(k in source[key]){
				if(source[key].hasOwnProperty(k)){
					target[key][k] = source[key][k];
				}
			}
		}
		catch(ex){}
	}
	
	for(i=0;i<keys.length;i++){
		setVals(config, env, keys[i]);
	}
	
	return config;
}

/**
* Pull in options information from global Digitrust object
*/
function initOptions(){
	initLog();
}

function initLog(){
	if(logInitialized){ return; }
	var opts = window.DigiTrust.initializeOptions;
	if(opts.logging != null){
		if(opts.logging.enable == false){
			// disable logging
			log = logObj.createLogger(LOGID, {level: 'ERROR'});
			log.enabled = false;
		}
		else{
			if(opts.logging.level == null){
				opts.logging.level = "INFO";
			}
			log = logObj.createLogger(LOGID, opts.logging);
		}			
	}
	logInitialized = true;
}


DigiTrustCommunication.iframe = null;
DigiTrustCommunication.iframeStatus = 0; // 0: no iframe; 1: connecting; 2: ready

DigiTrustCommunication._messageHandler = function (evt) {
    if (evt.origin !== getConfig().iframe.postMessageOrigin) {
		log.warn('message origin error. allowed: ' + getConfig().iframe.postMessageOrigin + ' \nwas from: ' + evt.origin);
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
            case 'Digitrust.shareIdToIframe.request':
                if(DigiTrust){
                    DigiTrust.getUser({}, function(resp){
                        //todo: need to handle success: false case with retry once again
                        //console.log("Sending post message back.");
                        resp.type = "Digitrust.shareIdToIframe.response";
                        evt.source.postMessage(resp, evt.origin);
                    }); 
                }else{
                    console.log("DigiTrust not found");
                    //todo: need to retry once again
                    // setTimeout(function(){
                    //     sendDigitrustIdinPostMessage(event);
                    // }, 500)
                }
                break;    
        }
    }
};

DigiTrustCommunication.startConnection = function (loadSuccess) {
	initOptions(); // initialization point
	
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
    }, getConfig().iframe.timeoutDuration);

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
    DigiTrustCommunication.iframe.src = getConfig().urls.digitrustIframe;
    DigiTrustCommunication.iframe.name = getConfig().iframe.locatorFrameName;
    DigiTrustCommunication.iframeStatus = 1;
    document.body.appendChild(DigiTrustCommunication.iframe);
	log.debug('communication frame added');
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
            redirects: options.redirects ? options.redirects : false,
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
