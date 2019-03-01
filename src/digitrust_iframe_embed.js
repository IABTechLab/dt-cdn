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
  debugger;
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
