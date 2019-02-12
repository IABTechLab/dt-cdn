/**
 * DigiTrust iFrame code
 * @module
 * 
 * This code is compiled and directly embedded into the dt.html page for distrubution.
 * In this manner we will trim down the package load.
 */ 


'use strict'

var DigiTrustCrypto = require('./modules/DigiTrustCrypto');
var DigiTrustCookie = require('./modules/DigiTrustCookie');

if (window && !window['dtFrame']) {
  window['dtFrame'] = {
    encrypt: DigiTrustCrypto.encrypt,
    cookie: DigiTrustCookie
  }
}
