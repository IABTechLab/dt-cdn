'use strict';

/**
 * GeneralConfig
 * @module
 * 
 * @description Configuration settings for various environments. 
 * Adapted from general.json to avoid errors with manual version number updates.
 * @author Chris Cole
 * 
 * */

var VERSION = require('../_version.js');

var VARIABLE_CURRENT_VERSION = "%CURRENT_VERSION%";
var VARIABLE_PRIOR_VERSION = "%PRIOR_VERSION%";

var configJson = {
  "prod": {
    "urls": {
      "digitrustHostPath": "https://cdn.digitru.st/prod/%CURRENT_VERSION%/",
      "digitrustRedirect": "https://cdn.digitru.st/prod/%CURRENT_VERSION%/redirect.html",
      "digitrustIframe": "https://cdn.digitru.st/prod/%CURRENT_VERSION%/dt.html",
      "digitrustIdService": "https://cdn-cf.digitru.st/id/v1",
      "optoutInfo": "http://www.digitru.st/about-this-notice/",
      "adblockCheck": "http://stats.aws.rubiconproject.com/"
    },
    "redirectInterval": {
      "exp": 7
    },
    "cookie": {
      "version": 2,
      "producer": "1CrsdUNAo6",
      "publisher": {
        "domainKeyValue": "",
        "pathKeyValue": "path=/;",
        "maxAgeMiliseconds": 604800000,
        "userObjectKey": "DigiTrust.v1.identity"
      },
      "digitrust": {
        "domainKeyValue": "domain=.digitru.st;",
        "pathKeyValue": "path=/;",
        "maxAgeMiliseconds": 31536000000,
        "userObjectKey": "DigiTrust.v1.identity",
        "resetKey": "DeleteEverything",
        "challenge": "DTChal",
        "optout": "optout",
        "optoutUser": {
          "id": "",
          "privacy": {
            "optout": true
          }
        },
        "errorUser": {
          "error": true
        }
      }
    },
    "iframe": {
      "timeoutDuration": 10000,
      "postMessageOrigin": "https://cdn.digitru.st"
    },
    "crypto": {
      "serverCryptoRate": 0.0
    },
    "logging": {
      "enable": false,
      "level": "ERROR"
    },
    "gvlVendorId": 64
  },
  "build": {
    "urls": {
      "digitrustHostPath": "https://cdn.digitru.st/prod/%PRIOR_VERSION%/",
      "digitrustRedirect": "https://cdn.digitru.st/prod/%PRIOR_VERSION%/redirect.html",
      "digitrustIframe": "https://cdn.digitru.st/prod/%PRIOR_VERSION%/dt.html",
      "digitrustIdService": "https://cdn-cf.digitru.st/id/v1",
      "optoutInfo": "http://www.digitru.st/about-this-notice/",
      "adblockCheck": "http://stats.aws.rubiconproject.com/"
    }
  },
  "local": {
    "urls": {
      "digitrustHostPath": "//localhost/dist/",
      "digitrustRedirect": "//localhost/dist/redirect.html",
      "digitrustIframe": "//local.digitru.st/dist/dt_debug.html",
      "digitrustIdService": "http://local.digitru.st/misc/faked_id_service_v1.json",
      "optoutInfo": "//localhost/dist/info.html",
      "adblockCheck": "//stats.aws.rubiconproject.com/"
    },
    "iframe": {
      "timeoutDuration": 10000,
      "postMessageOrigin": "http://local.digitru.st"
    },
    "crypto": {
      "serverCryptoRate": 1.0
    },
    "logging": {
      "level": "DEBUG"
    },
    "gvlVendorId": 64
  }
}


// =============================== METHODS TO RETURN SNAPSHOT OF CONFIG ======================

/**
 * Calculates the current version and previous version for purposes of file paths
 * in config.
 * @param {String} ver a package version number
 * @param {any} prevVer optional override to previous version for build purposes
 */
function computeVersions(ver, prevVer) {
  ver = ver || VERSION;

  var result = {
    current: null,
    prior: null
  };

  var currentVersion, prevVersion;
  var verParts = ver.split('.');
  var prevMinor = parseInt(verParts[verParts.length - 1]);

  if (isNaN(prevMinor)) {
    prevMinor = 0;
  }
  else {
    prevMinor = prevMinor - 1;
  }

  currentVersion = ver;
  verParts[verParts.length - 1] = new String(prevMinor);

  prevVersion = verParts.join('.');
  
  result.current = currentVersion;
  result.prior = prevVersion;

  return result;
}

function replaceUrlVariables(urlObj, variable, value) {
  var key, val;
  // Replace known URL values
  for (key in urlObj) {
    if (urlObj.hasOwnProperty(key)) {
      val = urlObj[key];
      if (val.indexOf(VARIABLE_CURRENT_VERSION) > -1) {
        urlObj[key] = val.replace(VARIABLE_CURRENT_VERSION, value);
      }
    }
  }
}

/**
 * Returns the full configuration JSON with adjustments applied for version numbering
 * @function
 * 
 * */
function getFullConfig(ver, prevVersion) {
  ver = ver || VERSION;

  var versionResult = computeVersions(ver, prevVersion);

  var config = configJson;
  replaceUrlVariables(config.prod.urls, VARIABLE_CURRENT_VERSION, versionResult.current);
  replaceUrlVariables(config.build.urls, VARIABLE_PRIOR_VERSION, versionResult.prior);

  return config;
}


module.exports = {
  getFullConfig: getFullConfig,
  computeVersions: computeVersions
}
