// var window = require('global/window');

var DigiTrust = require('./modules/DigiTrust');
var DigiTrustCookie = require('./modules/DigiTrustCookie');
var configGeneral = require('./config/general.json');

if (window !== undefined) {
    window.DigiTrust = DigiTrust;
    window.DigiTrustCookie = DigiTrustCookie;
    window.configGeneral = configGeneral;
}
