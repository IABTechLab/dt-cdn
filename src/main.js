var window = require('global/window');

var DigiTrust = require('./modules/DigiTrust');

if (window !== undefined) {
    window.DigiTrust = DigiTrust;
    
    DigiTrust.initialize();
}