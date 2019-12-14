'use strict';

var env = require('../config/env.json').current;
var gdprInfo = require('../config/gdpr-lang.json');

var DigiTrustConsent = {};

var getConfig = function () {
  return DigiTrust._config.getConfig();
}

var getLogger = function () {
  return window.DigiTrust.util.getGlobalLogger();
}

DigiTrustConsent.browserLanguageIsEU = function (languages) {
    for (var i = 0; i < languages.length; i++) {
        if (gdprInfo.gdprLanguages.indexOf(languages[i].toLowerCase()) >= 0) {
            return true;
        }
    }
    return false;
};

DigiTrustConsent.cmpConsent = function (languages) {
    return false;
};

DigiTrustConsent.gdprApplies = function (options) {
    var browserLanguageCheckResult = DigiTrustConsent.browserLanguageIsEU(navigator.languages ||
        [navigator.browserLanguage]);
    return browserLanguageCheckResult;
};

DigiTrustConsent.hasConsent = function (options, callback) {
  var log = getLogger();

  var applies = DigiTrustConsent.gdprApplies();
  var vendorId = getConfig().getValue('gvlVendorId');
  if (env === 'local' || env === 'localdev') { applies = false; } // dev test

  if (typeof (window.__cmp) !== 'undefined') {
    window.__cmp('ping', null, function (pingReturn) {
      if (applies || (pingReturn.gdprAppliesGlobally)) {
        log.debug('GDPR consent rules apply from language or global GDPR settings.')
        window.__cmp('getVendorConsents', [vendorId], function (result) {
          var myconsent = result.vendorConsents[vendorId];
          log.debug('GDPR user consent value: ' + myconsent);
          callback(myconsent);
        });
      } else {
        callback(true);
      }
    });
  } else if (applies) {
    log.debug('GDPR consent rules apply.')
    callback(false);
  } else {
    callback(true);
  }
};

module.exports = {
    hasConsent: DigiTrustConsent.hasConsent
};
