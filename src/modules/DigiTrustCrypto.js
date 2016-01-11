'use strict';

var env = require('../config/env.json').current;
var configGeneral = require('../config/general')[env];
var helpers = require('./helpers');
var DTPublicKeyObject = require('../config/key.json');

var crypto = helpers.getBrowserCrypto();
var DigiTrustCrypto = {};

// Returns base64 string
DigiTrustCrypto.encrypt = function (valueToEncrypt, callback) {

    var algorithm, publicKey;
    if (helpers.isSafari()) {
        console.log('encrypting safari');
        algorithm = 'jwk';
        publicKey = helpers.asciiToUint8Array(JSON.stringify(DTPublicKeyObject.jwk));
    } else {
        console.log('encrypting chrome');
        algorithm = 'spki';
        publicKey = helpers.base64StringToArrayBuffer(DTPublicKeyObject.spki);
    }

    crypto.subtle.importKey(
        algorithm,
        publicKey,
        {
            name: DTPublicKeyObject.type,
            hash: {
                name: DTPublicKeyObject.hash.name
            }
        },
        false,
        ["encrypt"]
    )
    .then( function(cryptokey) {
        crypto.subtle.encrypt(
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
        .then( function (encryptedValue) {
            // Returns an ArrayBuffer containing the encrypted data
            var encryptedValueEncodedB64 = helpers.arrayBufferToBase64String(encryptedValue);
            console.log('just encrypted', algorithm, encryptedValueEncodedB64);
            return callback(encryptedValueEncodedB64);
        });
    });
};

// Returns string; input is a base64 string
/*
FOR TESTING ONLY
DigiTrustCrypto.decrypt = function (valueToDecrypt, callback) {

    var algorithm, privateKey;
    if (helpers.isSafari()) {
        console.log('decrypting safari');
        algorithm = 'jwk';
        privateKey = helpers.asciiToUint8Array(JSON.stringify(DTPublicKeyObject.jwkPrivate));
    } else {
        console.log('decrypting chrome');
        algorithm = 'pkcs8';
        privateKey = helpers.base64StringToArrayBuffer(DTPublicKeyObject.pkcs8);
    }

    crypto.subtle.importKey(
        algorithm,
        privateKey,
        {
            name: DTPublicKeyObject.type,
            hash: {
                name: DTPublicKeyObject.hash.name
            }
        },
        false,
        ["decrypt"]
    )
    .then( function(cryptokey) {
        crypto.subtle.decrypt(
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
        .then( function (decryptedValueArrayBuffer) {
            var decryptedValueString = helpers.ab2str(decryptedValueArrayBuffer);
            console.log('just decrypted', algorithm, decryptedValueString);
            return callback(decryptedValueString);
        });
    });
};*/

module.exports = DigiTrustCrypto;
