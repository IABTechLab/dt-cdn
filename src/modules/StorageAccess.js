'use strict';

var StorageAccess = {};

StorageAccess.hasStorageAccess = function () {
    // returns a Promise
    var p = null;
    if (typeof document.hasStorageAccess === 'function') {
      p = document.hasStorageAccess();
    } else {
      p = new Promise(function(resolve, reject) {
        resolve(true);
      });
    }
    return p;
};

StorageAccess.requestStorageAccess = function () {
    // returns a Promise
    var p = null;
    if (typeof document.requestStorageAccess === 'function') {
      p = document.requestStorageAccess();
    } else {
      p = new Promise(function(resolve, reject) {
        reject();
      });
    }
    return p;
};

module.exports = {
  hasStorageAccess: StorageAccess.hasStorageAccess,
  requestStorageAccess: StorageAccess.requestStorageAccess
};
