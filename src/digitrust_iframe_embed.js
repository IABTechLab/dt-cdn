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
var util = require('./dtFrame/frameUtils');

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
