'use strict';

//var env = require('../config/env.json').current;
//var configGeneral = require('../config/general')[env];
var config = require('./ConfigLoader');
var helpers = require('./helpers');
var ServerCrypto = require('./ServerCrypto');
var DTPublicKeyObject = require('../config/key.json');

var LOGID = 'DigiTrustCrypto';
var log = {}; // this will later be re-initialized if the init pass requires
var logInitialized = false;

var crypto_browser = helpers.getBrowserCrypto();

function initLog(){
	if(logInitialized){ return; }
  log = helpers.createLogger(LOGID);
	logInitialized = true;
}

/**
* @function
* Tests to see if we are dealing with the legacy msCrypto object from IE 11.
*/
function isMsCrypto(cryptoObj){
	var msg;
	if(!cryptoObj || !cryptoObj.subtle){
		cryptoObj = window.crypto;
	}
	if(!cryptoObj || !cryptoObj.subtle){
		msg = 'Invalid browser crypt object';
		log.debug(msg);
		//throw msg;
		return false;
	}
	
	if(!window.msCrypto){
		return false;
	}
	
	try{
		var genOp = cryptoObj.subtle.generateKey( 
			{ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([0x01, 0x00, 0x01]) }, 
			false, 
			["encrypt", "decrypt"]);
			
		if(typeof(genOp.oncomplete) !== 'undefined'){
			return true;
		}
		return false; 
	}
	catch(ex){
		return false;
	}
}

var DigiTrustCrypto = {};

DigiTrustCrypto.getKeyVersion = function () {
    return DTPublicKeyObject.version;
};

// Returns base64 string
DigiTrustCrypto.encrypt = function (valueToEncrypt, callback) {
    var keyType;
    var publicKey;
	initLog();
	
	if(crypto_browser == null){
		crypto_browser = helpers.getBrowserCrypto();
	}
	
    if (helpers.isSafari()) {
        keyType = 'jwk';
        publicKey = DTPublicKeyObject.jwk;
    } else {
        keyType = 'spki';
        publicKey = helpers.base64StringToArrayBuffer(DTPublicKeyObject.spki);
    }
  if (window.crypto && !window.crypto.subtle && helpers.isChrome() &&
    (Math.random() < config.getValue('crypto.serverCryptoRate') )) {
        // chrome 61 removes crypto.subtle on insecure origins
        crypto_browser.subtle = ServerCrypto.mockCryptoSubtle();
    }
	
	log.debug('encrypt value: ', valueToEncrypt);
	
	if(isMsCrypto(crypto_browser)){
		msieEncrypt(valueToEncrypt, keyType, publicKey, callback);
		return;
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
            return callback(encryptedValueEncodedB64);
        })
          .catch(function (err) {
            log.error('Failure encrypting value.', err);
        });
    });
};

DigiTrustCrypto.decrypt = function (valueToDecrypt, callback) {
    var keyType = 'jwk';
    var privateKey = DTPublicKeyObject.jwkPrivate;
	var publicKey;
	initLog();
	
	log.debug('attempt to decrypt value: ', valueToDecrypt);
	
	if(crypto_browser == null){
		crypto_browser = helpers.getBrowserCrypto();
	}
	
    if (helpers.isSafari()) {
        keyType = 'jwk';
        publicKey = DTPublicKeyObject.jwk;
    } else {
        keyType = 'spki';
        publicKey = helpers.base64StringToArrayBuffer(DTPublicKeyObject.spki);
    }
	
	if(isMsCrypto(crypto_browser)){
		msieDecrypt(valueToDecrypt, keyType, publicKey, callback);
		return;
	}

	log.debug('ready to create key');
	var cryptKey = crypto_browser.subtle.importKey(
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
    );
	
	cryptKey.then(function (cryptokey) {
		log.debug('enter decrypt with key', cryptokey);
		
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
            log.debug('just decrypted', keyType, decryptedValueString);
            return callback(decryptedValueString);
        });
    });
};

/**
* Decrypt using the proprietary 
*/
var msieDecrypt = function (valueToDecrypt, keyType, privateKey, callback) {

	var keyOp = crypto_browser.subtle.importKey(
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
		);
	
	keyOp.oncomplete = function(evt){
		var cryptokey = evt.target.result;
        var decryptOp = crypto_browser.subtle.decrypt(
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
		decryptOp.onerror = function(e){
			log.error(e);
		}
		
		decryptOp.oncomplete = function(e){
			var decryptedValueArrayBuffer = e.target.result;
			
            var decryptedValueString = helpers.ab2str(decryptedValueArrayBuffer);
            log.debug('just decrypted', keyType, decryptedValueString);
            return callback(decryptedValueString);
			
		}
	}
}

/**
* @function
* Encryption path for MSIE 11 browsers that don't support current Crypto object standard.
*/
var msieEncrypt = function (valueToEncrypt, keyType, publicKey, callback) {	
	
    var keyOp = crypto_browser.subtle.importKey(
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
    );
	
	keyOp.oncomplete = function(evt){
		var cryptokey = evt.target.result;
		
		try{
			var encryptOp = crypto_browser.subtle.encrypt(
				{
					name: DTPublicKeyObject.type,
					hash: {
						name: DTPublicKeyObject.hash.name
					}
				},
				cryptokey,
				// string (User ID) to array buffer
				helpers.str2ab(valueToEncrypt)
			);
			
			encryptOp.oncomplete = function(e){
				var encryptedValue = e.target.result;
				var encryptedValueEncodedB64 = (typeof(encryptedValue) === 'string') ?
					encryptedValue :
					helpers.arrayBufferToBase64String(encryptedValue);
				  log.debug('just encrypted', keyType, encryptedValueEncodedB64);
				return callback(encryptedValueEncodedB64);
			};
		}
		catch(err){
			log.error('Digitrust server MSIE Encrypt error', err);
		}
	}	
}



module.exports = DigiTrustCrypto;
