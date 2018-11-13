var DigiTrust = require('./modules/DigiTrust');
var DigiTrustCrypto = require('./modules/DigiTrustCrypto');

if (window !== undefined && window.DigiTrust == null) {
    window.DigiTrust = DigiTrust;
//    window.DigiTrustCrypto = DigiTrustCrypto;
}
