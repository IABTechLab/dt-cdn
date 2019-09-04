'use strict';

var config = require('./ConfigLoader');
var helpers = require('./helpers');

var ServerCrypto = {};

function getConfig() {
  if (window && window.DigiTrust && window.DigiTrust._config) {
    return window.DigiTrust._config.getConfig();
  }
  // if not on global return new instance
  return config;
}


ServerCrypto.mockCryptoSubtle = function () {
    return {
        importKey: function (keyType, publicKey, conf, ignored, operations) {
            return new Promise(function (resolve, reject) {
                resolve();
            });
        },
        encrypt: function (options, cryptokey, raw) {
          return new Promise(function (resolve, reject) {
            helpers.xhr.promise('GET', getConfig().getValue('urls.digitrustIdService'))
                    .then(function (contents) {
                        var encryptedIdentity = JSON.parse(contents);
                        resolve(encryptedIdentity.id);
                    })
                    .catch(function (err) {
                        reject(err);
                    });
            });
        }
    };
};

module.exports = ServerCrypto;
