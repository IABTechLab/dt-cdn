'use strict';
var noop = function () { };

var log = {}; // this will later be re-initialized if the init pass requires
log.debug = log.log = log.info = log.error = noop;


/**
 * Convert a binary ArrayBuffer to base64 string
 * 
 * @param {Object} arrayBuffer
 */
function arrayBufferToBase64String(arrayBuffer) {
  var byteArray = new Uint8Array(arrayBuffer);
  var byteString = '';
  for (var i = 0; i < byteArray.byteLength; i++) {
    byteString += String.fromCharCode(byteArray[i]);
  }
  return btoa(byteString);
};

// Decode from base64 back to array buffer
function base64StringToArrayBuffer (base64) {
  var binary_string = atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
};

var util = {
  /**
   * Check to see if an object is empty
   * @param {any} obj
   */
  isEmpty: function (obj) {
    var t = typeof (obj),
      k;
    if (t === 'undefined' || obj == null) {
      return true;
    }
    else if (t !== 'object') {
      return false;
    }

    if (obj.hasOwnProperty('length') && obj.length == 0) {
      return true;
    }
    for (k in obj) {
      if (obj.hasOwnProperty(k)) {
        return false;
      }
    }
    return true;
  },

  /**
 * Convert a binary ArrayBuffer to base64 string
 * 
 * @param {any} arrayBuffer
 */
  encodeArrayBuffer: arrayBufferToBase64String,

  /**
 * Decode a base64 string back into a binary ArrayBuffer
 * 
 * @param {string} arrayBuffer
 */
  decodeToArrayBuffer: base64StringToArrayBuffer

};

module.exports = util;
