var window = require('./modules/window');

var DigiTrust = require('./modules/DigitTrust');

module.exports.DigiTrust = new DigiTrust();

if (window !== undefined) {
    // Exports the meat of the project
    window.DigiTrust = module.exports.DigiTrust;
}
