'use strict';

/**
 * DigiTrust core module
 * @module DigiTrust
 * 
 * */


var env = require('../config/env.json').current;
var configGeneral = require('../config/general.json')[env];
var configErrors = require('../config/errors.json');
var configInitializeOptions = require('../config/initializeOptions.json');
var helpers = require('./helpers');
var DigiTrustConsent = require('./DigiTrustConsent');
var DigiTrustCookie = require('./DigiTrustCookie');
var Dcom = require('./DigiTrustCommunication');
var DigiTrustCrypto = require('./DigiTrustCrypto');

var LOGID = 'Digitrust'; // const, but older browser support
var logObj = require('./logger');
var log = logObj.createLogger(LOGID, {level: 'ERROR', enabled: false}); // this will later be re-initialized if the init pass requires
var VERSION = require('../_version.js');
var isFunc = helpers.isFunc;

var DigiTrust = {
    version: VERSION,
    isClient: false,
    _config: {
        configGeneral: configGeneral,
        errors: configErrors,
        initOptions: configInitializeOptions,
        crypto: DigiTrustCrypto
    },
    cookie: DigiTrustCookie,    
    util: helpers
};
var noop = function(){}

DigiTrust.initializeOptions = {};

/**
 * Tests to see if a member ID is valid
 * @param {any} memberId
 */
var isMemberIdValid = function (memberId) {
    if (memberId && memberId.length > 0) {
        return true;
    } else {
        throw configErrors.en.memberId;
    }
};

/**
* @function
* Set options on the global DigiTrust object by merging base options
* with consumer supplied options.
* @return {object} options The combined options object that was assigned to DigiTrust.initializeOptions
*/
DigiTrust._setDigiTrustOptions = function (options) {
	// we have added a polyfill to handle IE. In this manner the base objects aren't corrupted
	var opts = Object.assign({}, configInitializeOptions, options);
	window.DigiTrust.initializeOptions = opts;
	
	if(opts.logging == null){
		opts.logging = configGeneral.logging
	}
	
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
	
    return window.DigiTrust.initializeOptions;
};

/*
 * Internal initilizer method
 * 
 */ 
var initInternal = function(options, initCb) {
  log.debug('init Internal');
  if (!isFunc(initCb)) {
    initCb = noop;
  }

  // Callback invoker to catch user exceptions
  var doCb = function (idObj) {
    try {
      return initCb(idObj);
    }
    catch (ex) {
      log.error('DigiTrust init callback exception in user code', ex);
      return null;
    }
  }
  try {
    var idResp = {success: false};

    options = DigiTrust._setDigiTrustOptions(options);
		log.debug('init options completed');


        // allow for a circuit break to disable the world
        if (Math.random() > options.sample) {
          return doCb(idResp);
        }

        // Verify Publisher's Member ID
        if (!isMemberIdValid(options.member)) {
          return doCb(idResp);
        }

        DigiTrustConsent.hasConsent(null, function (consent) {
            if (consent) {
                DigiTrustCookie.getUser(options, function (err, identityObject) {
                    if (!err) {
                        idResp.success = true;
                        idResp.identity = identityObject;
                    }
                  return doCb(idResp);
                });
            } else {
              return doCb(idResp);
            }
        });
    } catch (e) {
		log.error('Error in DigiTrust initializer', e);
      return doCb({success: false});
    }
	
}

/**
* @function
* @exports DigiTrust/initialize
 * Initialize the DigiTrust framework.
 * @param {any} options
 * @param {function} initCb Callback from the initialization method.
 */
DigiTrust.initialize = function (options, initCb) {
	var document = window.document;
    var ready = document.readyState;
    DigiTrust.isClient = true; // init only called on clients

  var initRecall = function (event) {
    DigiTrust.initialize(options, initCb);
  };

	if (!ready || ready == 'loading') {
    document.addEventListener("DOMContentLoaded", initRecall);
	}
  else {
    try {
      document.removeEventListener("DOMContentLoaded", initRecall);
    }
    catch (ex) { }
		initInternal(options, initCb);
	}	
};

/**
* @function
 * @exports DigiTrust/getUser
 * Get the user object, if available, and return using callback.
 * The ID in the user object will be encrypted.
 * @param {any} options
 * @param {function} callback Async callback method
 */
DigiTrust.getUser = function (options, callback) {
    options = DigiTrust._setDigiTrustOptions(options);
    var async = (typeof callback === 'function') ? true : false;
    var idResp = {
        success: false
    };

    try {
        // Verify Publisher's Member ID
        if (!isMemberIdValid(options.member)) {
            return (async === false) ? idResp : callback(idResp);
        }

        if (async === false) {
            // Get publisher cookie
            var identityJSON = DigiTrustCookie.getUser();
            if (!helpers.isEmpty(identityJSON)) {
                idResp.success = true;
                idResp.identity = identityJSON;
            }
            return idResp;
        } else {
            DigiTrustConsent.hasConsent(null, function (consent) {
                if (consent) {
                    options.ignoreLocalCookies = true;
                    DigiTrustCookie.getUser(options, function (err, identityObject) {
                        if (err) {
                            return callback(idResp);
                        } else {
                            idResp.success = true;
                            idResp.identity = identityObject;
                            return callback(idResp);
                        }
                    });
                } else {
                    return callback(idResp);
                }
            });
        }
    } catch (e) {
        return (async === false) ? idResp : callback(idResp);
    }
};

/**
* @function
 * @exports DigiTrust/sendReset
 * Send a reset message to the DigiTrust frame instructing it to expire and remove the DigiTrust identity cookie.
 * @param {any} options
 * @param {function} callback
 */
DigiTrust.sendReset = function (options, callback) {
    Dcom.sendReset();
};

module.exports = DigiTrust
