/**
 * DigiTrust iFrame code
 * @module
 * 
 * This code is compiled and directly embedded into the dt.html page for distrubution.
 * In this manner we will trim down the package load.
 */ 


'use strict'

var DigiTrustCrypto = require('./dtFrame/cryptoLib');
var DigiTrustCookie = require('./dtFrame/cookieDigiFrame');
var env = require('./config/env.json').current;
var configGeneral = require('./config/general.json')[env];
var configErrors = require('./config/errors.json');
var configInitializeOptions = require('./config/initializeOptions.json');
var LOGID = 'DigiTrustFrame';
var logObj = require('./modules/logger');
var log = logObj.createLogger(LOGID, { level: 'ERROR' }); // this will later be re-initialized if the init pass requires
var logInitialized = false;


function initLog() {
  if (logInitialized) { return; }
  var opts = configGeneral.logging;
  if (opts.logging != null) {
    if (opts.logging.enable == false) {
      // disable logging
      log = logObj.createLogger(LOGID, { level: 'ERROR' });
      log.enabled = false;
    }
    else {
      if (opts.logging.level == null) {
        opts.logging.level = "INFO";
      }
      log = logObj.createLogger(LOGID, opts.logging);
    }
  }
  logInitialized = true;

  DigiTrustCrypto.setLogger(log);

}

initLog();




/*
 * Utility object
 */ 
var util = {
  /**
   * Check to see if an object is empty
   * @param {any} obj
   */
  isEmpty: function (obj) {
    var t = typeof (obj),
      k;
    if (t !== 'undefined' || obj == null) {
      return true;
    }
    else if (t !== 'object') {
      return false;
    }

    if (obj.hasOwnProperty('length') && obj.length == 0){
      return true;
    }
    for (k in obj) {
      if (obj.hasOwnProperty(k)){
        return false;
      }
    }
    return true;
  }
}

if (window && !window['dtFrame']) {
  window['dtFrame'] = {
    encrypt: DigiTrustCrypto.encrypt,
    cookie: DigiTrustCookie,
    _config: {
      configGeneral: configGeneral,
      errors: configErrors,
      initOptions: configInitializeOptions,
      crypto: DigiTrustCrypto
    },
    util: util
  }

  window.DigiTrust = window['dtFrame']
}
