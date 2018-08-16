'use strict';

var env = require('../config/env.json').current;
var configGeneral = require('../config/general')[env];
var helpers = require('./helpers');
var ServerCrypto = require('./ServerCrypto');
var DTPublicKeyObject = require('../config/key.json');

var crypto_browser = helpers.getBrowserCrypto();
var DigiTrustCrypto = {};

DigiTrustCrypto.getKeyVersion = function () {
    return DTPublicKeyObject.version;
};

// Returns base64 string
DigiTrustCrypto.encrypt = function (valueToEncrypt, callback) {
    var keyType;
    var publicKey;
    if (helpers.isSafari()) {
        keyType = 'jwk';
        publicKey = DTPublicKeyObject.jwk;
    } else {
        keyType = 'spki';
        publicKey = helpers.base64StringToArrayBuffer(DTPublicKeyObject.spki);
    }
    if (window.crypto && !window.crypto.subtle && helpers.isChrome() &&
            (Math.random() < configGeneral.crypto.serverCryptoRate)) {
        // chrome 61 removes crypto.subtle on insecure origins
        crypto_browser.subtle = ServerCrypto.mockCryptoSubtle();
    }

    crypto_browser.subtle.importKey(
        keyType,
        publicKey,
        {
            name: DTPublicKeyObject.type,
            hash: {
                name: DTPublicKeyObject.hash.name
            }
        },
        false,
        ['encrypt']
    )
    .then(function (cryptokey) {
        crypto_browser.subtle.encrypt(
            {
                name: DTPublicKeyObject.type,
                hash: {
                    name: DTPublicKeyObject.hash.name
                }
            },
            cryptokey,
            // string (User ID) to array buffer
            helpers.str2ab(valueToEncrypt)
        )
        .then(function (encryptedValue) {
            // Returns an ArrayBuffer containing the encrypted data
            // ServerCrypto returns a string value; in-browser crypto returns ArrayBuffer
            var encryptedValueEncodedB64 = (typeof(encryptedValue) === 'string') ?
                encryptedValue :
                helpers.arrayBufferToBase64String(encryptedValue);
            // console.log('just encrypted', keyType, encryptedValueEncodedB64);
            return callback(encryptedValueEncodedB64);
        })
        .catch(function (err) {
        });
    });
};

// Returns string; input is a base64 string
// FOR TESTING ONLY
// FOR TESTING ONLY - remove
// FOR TESTING ONLY - remove
// FOR TESTING ONLY
DigiTrustCrypto.decrypt = function (valueToDecrypt, callback) {
    var keyType = 'jwk';
    var privateKey = DTPublicKeyObject.jwkPrivate;

    crypto_browser.subtle.importKey(
        keyType,
        privateKey,
        {
            name: DTPublicKeyObject.type,
            hash: {
                name: DTPublicKeyObject.hash.name
            }
        },
        false,
        ['decrypt']
    )
    .then(function (cryptokey) {
        crypto_browser.subtle.decrypt(
            {
                name: DTPublicKeyObject.type,
                hash: {
                    name: DTPublicKeyObject.hash.name
                }
            },
            cryptokey,
            // Encrypted User ID (b64) into array buffer
            helpers.base64StringToArrayBuffer(valueToDecrypt)
        )
        .then(function (decryptedValueArrayBuffer) {
            var decryptedValueString = helpers.ab2str(decryptedValueArrayBuffer);
            console.log('just decrypted', keyType, decryptedValueString);
            return callback(decryptedValueString);
        });
    });
};

module.exports = DigiTrustCrypto;
