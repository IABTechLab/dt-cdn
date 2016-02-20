// var window = require('global/window');
var DigiTrust = require('./modules/DigiTrust');
DigiTrust.isClient = true;

if (window !== undefined) {
    window.DigiTrust = DigiTrust;
}
