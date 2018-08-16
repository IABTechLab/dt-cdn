// var window = require('global/window');
var env = require('./config/env.json').current;
var configGeneral = require('./config/general.json')[env];
var DigiTrust = require('./modules/DigiTrust');
DigiTrust.isClient = false;
var DigiTrustCookie = require('./modules/DigiTrustCookie');
var DigiTrustCrypto = require('./modules/DigiTrustCrypto');
var StorageAccess = require('./modules/StorageAccess');
var helpers = require('./modules/helpers');

if (window !== undefined) {
    window.DigiTrust = DigiTrust;
    window.DigiTrustCookie = DigiTrustCookie;
    window.DigiTrustCrypto = DigiTrustCrypto;
    window.configGeneral = configGeneral;
    window.helpers = helpers;
}
