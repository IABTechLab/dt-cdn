'use strict';

var env = require('../config/env.json').current;
var configGeneral = require('../config/general.json')[env];
var configErrors = require('../config/errors.json');

var LOGID = 'DigiTrustCommunication';
var logObj = require('./logger');
var log = logObj.createLogger(LOGID, {level: 'ERROR'}); // this will later be re-initialized if the init pass requires
var logInitialized = false;
var pubsub = require('./MinPubSub').createPubSub({
    host: location.host
});

var DC = {};

var Dt = 'DigiTrust',
  kID = Dt + '.identity',
  kIframe = Dt + '.iframe';

// Pubsub sync keys
var MKEY = {
  ready: kIframe + '.ready',
  ifrErr: kIframe + '.error',
  idSync: kID + '.response.sync',
  idResp: kID + '.response',
  idReset: kID + '.reset',
  idGet: kID + '.request'
};

var getConfig = function () {
  return DigiTrust._config.getConfig();
}

/**
* Pull in options information from global Digitrust object
*/
function initOptions(){
	initLog();
}

function isFunc(fn) {
  return typeof (fn) === 'function';
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


DC.iframe = null;
DC.iframeStatus = 0; // 0: no iframe; 1: connecting; 2: ready

/**
 * Post Message handler
 * @function 
 * 
 * @param {any} evt
 */
function _messageHandler(evt) {
  var conf = getConfig();
  var msgKey = evt.data.type;

    if (evt.origin !== conf.iframe.postMessageOrigin) {

      switch (msgKey) {
            case 'Digitrust.shareIdToIframe.request':
                if(DigiTrust){
                    DigiTrust.getUser({member: window.DigiTrust.initializeOptions.member}, function(resp){
                        resp.type = "Digitrust.shareIdToIframe.response";
                        evt.source.postMessage(resp, evt.origin);
                    });
                }else{
                    console.log("DigiTrust not found");
                }
                break;
            default:
                log.warn('message origin error. allowed: ' + conf.iframe.postMessageOrigin + ' \nwas from: ' + evt.origin);
        }
    }
    else {      
      switch (msgKey) {
        case MKEY.ready:
          pubsub.publish(msgKey, [true]);
          break;
        default:
          pubsub.publish(msgKey, [evt.data.value]);
          break;
       }
    }
};

DC.startConnection = function (loadSuccess) {
	initOptions(); // initialization point
    var conf = getConfig();
	
    /*
        If there is a connection problem, or if adblocker blocks the request,
        start a 10 second timeout to notify the caller. Clear the timeout upon
        successful connection to the iframe

        Note: onload is executed even on non 2XX HTTP STATUSES (e.g. 404, 500)
              for cross-domain iframe requests
    */
    var iframeLoadErrorTimeout = setTimeout(function () {
        loadSuccess(false);
        DC.iframeStatus = 0;
    }, conf.iframe.timeoutDuration);

  pubsub.subscribe(MKEY.ready, function (iframeReady) {
        clearTimeout(iframeLoadErrorTimeout);
        DC.iframeStatus = 2;
        loadSuccess(true);
    });

  pubsub.subscribe(MKEY.ready, function (iframeReady) {
    clearTimeout(iframeLoadErrorTimeout);
    DC.iframeStatus = 2;
    loadSuccess(true);
  });

    // Add postMessage listeners
    window.addEventListener('message', _messageHandler, false);

    DC.iframe = document.createElement('iframe');
    DC.iframe.style.display = 'none';
    DC.iframe.src = conf.urls.digitrustIframe;
    DC.iframe.name = consts.locatorFrameName || '__dtLocator';
    DC.iframeStatus = 1;
    document.body.appendChild(DC.iframe);
	log.debug('communication frame added');
};

/**
 * Publishes a request to the communication pipe.
 * @param {any} sendRequestFunction
 * @param {any} options
 */
DC.sendRequest = function (sendRequestFunction, options) {
    if (DC.iframeStatus === 2) {
        sendRequestFunction(options);
    } else if (DC.iframeStatus === 1) {
        // This mimics a "delay", until the iframe is ready
      pubsub.subscribe(MKEY.ready, function (iframeReady) {
            sendRequestFunction(options);
        });
    } else if (DC.iframeStatus === 0) {
        // Create communication gateway with digitru.st iframe
        DC.startConnection(function (loadSuccess) {
            if (loadSuccess) {
                sendRequestFunction(options);
            } else {
                throw new Error(configErrors.en.iframeError);
            }
        });
    }
};

/**
 * Request the identity cookie from the DigiTrust iframe domain.
 * @param {any} options
 */
DC.getIdentity = function (options) {
    options = options ? options : {};
    var _sendIdentityRequest = function (options) {
        var identityRequest = {
          version: 1,
          type: MKEY.idGet,
          syncOnly: options.syncOnly ? options.syncOnly : false,
          redirects: options.redirects ? options.redirects : false,
          value: {}
        };
        DC.iframe.contentWindow.postMessage(identityRequest, DC.iframe.src);
    };

    DC.sendRequest(_sendIdentityRequest, options);
};

DC.sendReset = function (options) {
    var DigiTrustCookie = require('./DigiTrustCookie');
    DigiTrustCookie.setResetCookie();
    var _request = function (options) {
        var requestPayload = {
          version: 1,
          type: MKEY.idReset
        };
        DC.iframe.contentWindow.postMessage(requestPayload, DC.iframe.src);
    };

    DC.sendRequest(_request, options);
};

/**
 * Subscribe to given message topic in the global pubsub object.
 * @param {any} message topic in pubsub
 * @param {any} handler
 */
function listen(message, handler) {
  if (!isFunc(handler)) {
    return;
  }
  pubsub.subscribe(message, handler);
}

// var DigiTrustCommunication = DC;

module.exports = {
  getIdentity: DC.getIdentity,
  startConnection: DC.startConnection,
  sendReset: DC.sendReset,
  MsgKey: MKEY,
  listen: listen
};
