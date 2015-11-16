// var window = require('global/window');
var env = require('./config/env.json').current;
var configGeneral = require('./config/general.json')[env];
var DigiTrust = require('./modules/DigiTrust');
DigiTrust.isClient = false;
var DigiTrustCookie = require('./modules/DigiTrustCookie');
var DigiTrustAppContainer = require('./modules/DigiTrustAppContainer');
var helpers = require('./modules/helpers');

if (window !== undefined) {
    window.DigiTrust = DigiTrust;
    window.DigiTrustCookie = DigiTrustCookie;
    window.DigiTrustAppContainer = DigiTrustAppContainer;
    window.configGeneral = configGeneral;
    window.helpers = helpers;
}
