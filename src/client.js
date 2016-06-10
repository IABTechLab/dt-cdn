var DigiTrust = require('./modules/DigiTrust');
var DigiTrustCrypto = require('./modules/DigiTrustCrypto');
DigiTrust.isClient = true;

if (window !== undefined) {
    window.DigiTrust = DigiTrust;
    window.DigiTrustCrypto = DigiTrustCrypto;
}
