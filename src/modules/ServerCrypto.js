'use strict';

var env = require('../config/env.json').current;
var configGeneral = require('../config/general.json')[env];
var helpers = require('./helpers');

var ServerCrypto = {};

ServerCrypto.mockCryptoSubtle = function() {
  return {
    importKey: function(keyType, publicKey, conf, ignored, operations) {
      return new Promise(function(resolve, reject) {
        resolve();
      });
    },
    encrypt: function(options, cryptokey, raw) {
      return new Promise(function(resolve, reject) {
        helpers.xhr.promise('GET', configGeneral.urls.digitrustIdService)
          .then(function(contents) {
            var encryptedIdentity = JSON.parse(contents);
            resolve(encryptedIdentity.id);
          })
          .catch(function(err) {
            reject(err);
          });
      });
    }
  }
};

module.exports = ServerCrypto;
