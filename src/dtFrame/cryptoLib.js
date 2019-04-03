'use strict';

var env = require('../config/env.json').current;
var configGeneral = require('../config/general')[env];
var helpers = require('../modules/helpers');
var util = require('./frameUtils');
var ServerCrypto = require('./serverCrypto');
var DTPublicKeyObject = require('../config/key.json');
var noop = function () { };

var LOGID = 'DigiTrustCrypto';
var log = {}; // this will later be re-initialized if the init pass requires
log.debug = log.log = log.info = log.error = noop;

var clientCrypto;



/**
  * @function
  * Safely get the browser crypto library to account for IE 11
  * and Chrome on non SSL connection
  * 
  * */
function getBrowserCrypto() {
  // WebKit crypto subtle
  var cryptoObj = window.crypto || window.msCrypto;

  // This is outdated and probably should be removed
  if (window.crypto && !window.crypto.subtle && window.crypto.webkitSubtle) {
    window.crypto.subtle = window.crypto.webkitSubtle;
  }

  // Chrome on non-SSL sites
  if (cryptoObj && !cryptoObj.subtle && helpers.isChrome() &&
    (Math.random() < configGeneral.crypto.serverCryptoRate)) {
    // chrome 61 removes crypto.subtle on insecure origins
    cryptoObj.subtle = ServerCrypto.mockCryptoSubtle();
  }

  return cryptoObj;
}

clientCrypto = getBrowserCrypto();

/**
* @function
* Tests to see if we are dealing with the legacy msCrypto object from IE 11.
*/
function isMsCrypto(cryptoObj) {
  var msg;
  if (!cryptoObj || !cryptoObj.subtle) {
    cryptoObj = window.crypto;
  }
  if (!cryptoObj || !cryptoObj.subtle) {
    msg = 'Invalid browser crypt object';
    log.debug(msg);
    //throw msg;
    return false;
  }

  if (!window.msCrypto) {
    return false;
  }

  try {
    var genOp = cryptoObj.subtle.generateKey(
      { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([0x01, 0x00, 0x01]) },
      false,
      ["encrypt", "decrypt"]);

    if (typeof (genOp.oncomplete) !== 'undefined') {
      return true;
    }
    return false;
  }
  catch (ex) {
    return false;
  }
}

/**
 * Main static crypto object used by the iFrame
 * */
var DigiTrustCrypto = {
  setLogger: function (logObj) {
    log = logObj;
  }
};

/**
  * @function
  * Generate a pseudo random ID for the user
  * 
  * */
DigiTrustCrypto.generateUserId = function () {
  var buffer = new Uint8Array(8);

  clientCrypto.getRandomValues(buffer);
  return util.encodeArrayBuffer(buffer);
};


DigiTrustCrypto.getKeyVersion = function () {
  return DTPublicKeyObject.version;
};

var MAX_SUBTLE_RETRIES = 10;
var retryCount = 0;

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

  log.debug('encrypt value: ', valueToEncrypt);

  if (isMsCrypto(clientCrypto)) {
    msieEncrypt(valueToEncrypt, keyType, publicKey, callback);
    return;
  }

  // set a break/retry for ServerCrypto race condition
  if (!clientCrypto.subtle) {
    log.warn('DigiTrust ServerCrypt init retry attempt');
    console.warn('console DigiTrust ServerCrypt init retry attempt')
    clientCrypto = getBrowserCrypto();
    if (retryCount++ < MAX_SUBTLE_RETRIES) {
      setTimeout(function () {
        DigiTrustCrypto.encrypt(valueToEncrypt, callback);
      }, 100);
    }
    else {
      console.error("Maximum crypto.subtle retry attempts reached for ServerCrypto mock");
    }
    return;
  }

  clientCrypto.subtle.importKey(
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
      clientCrypto.subtle.encrypt(
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
          var encryptedValueEncodedB64 = (typeof (encryptedValue) === 'string') ?
            encryptedValue :
            util.encodeArrayBuffer(encryptedValue);
          // console.log('just encrypted', keyType, encryptedValueEncodedB64);
          return callback(encryptedValueEncodedB64);
        })
        .catch(function (err) {
        });
    });
};

DigiTrustCrypto.decrypt = function (valueToDecrypt, callback) {
  var keyType = 'jwk';
  var privateKey = DTPublicKeyObject.jwkPrivate;
  var publicKey;

  log.debug('attempt to decrypt value: ', valueToDecrypt);

  if (helpers.isSafari()) {
    keyType = 'jwk';
    publicKey = DTPublicKeyObject.jwk;
  } else {
    keyType = 'spki';
    publicKey = helpers.base64StringToArrayBuffer(DTPublicKeyObject.spki);
  }

  if (isMsCrypto(clientCrypto)) {
    msieDecrypt(valueToDecrypt, keyType, publicKey, callback);
    return;
  }

  log.debug('ready to create key');
  var cryptKey = clientCrypto.subtle.importKey(
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

    clientCrypto.subtle.decrypt(
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

  var keyOp = clientCrypto.subtle.importKey(
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

  keyOp.oncomplete = function (evt) {
    var cryptokey = evt.target.result;
    var decryptOp = clientCrypto.subtle.decrypt(
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
    decryptOp.onerror = function (e) {
      console.error(e);
    }

    decryptOp.oncomplete = function (e) {
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

  var keyOp = clientCrypto.subtle.importKey(
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

  keyOp.oncomplete = function (evt) {
    var cryptokey = evt.target.result;

    try {
      var encryptOp = clientCrypto.subtle.encrypt(
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

      encryptOp.oncomplete = function (e) {
        var encryptedValue = e.target.result;
        var encryptedValueEncodedB64 = (typeof (encryptedValue) === 'string') ?
          encryptedValue :
          helpers.arrayBufferToBase64String(encryptedValue);
        // console.log('just encrypted', keyType, encryptedValueEncodedB64);
        return callback(encryptedValueEncodedB64);
      };
    }
    catch (err) {
      log.error('Digitrust server MSIE Encrypt error', err);
    }
  }
}



module.exports = DigiTrustCrypto;
