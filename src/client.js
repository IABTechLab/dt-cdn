// var window = require('global/window');
var DigiTrust = require('./modules/DigiTrust');
var DigiTrustCrypto = require('./modules/DigiTrustCrypto'); // REMOVE REMOVE REMOVE
 // REMOVE REMOVE REMOVE // REMOVE REMOVE REMOVE
  // REMOVE REMOVE REMOVE
DigiTrust.isClient = true;

if (window !== undefined) {
    window.DigiTrust = DigiTrust;
    window.DigiTrustCrypto = DigiTrustCrypto; // REMOVE REMOVE REMOVE
     // REMOVE REMOVE REMOVE
}
