'use strict';

/**
 * ConfigLoader
 * @module
 * 
 * @description Centralizes loading and access of configuration values to reduce duplication.
 * @author Chris Cole
 * 
 * */

var buildEnv = require('../config/env.json').current;
var genConfig = require('../config/GeneralConfig').getFullConfig();
var activeConfig = genConfig[buildEnv];
var helpers = require('./helpers');
var myConfig;
var noop = function () { };

var loadDepth = 0; // beak over recursion

var LOGID = 'DigiTrust_ConfigLoader';
var log = {}; // this will later be re-initialized if the init pass requires
var logInitialized = false;
// Unit tests fail to have some helper methods initialized
var mockLog = {
  log: noop,
  warn: noop,
  info: noop,
  error: noop
}

function initLog() {
  if (logInitialized) { return; }

  if (typeof (helpers.createLogger) === 'function') {
    log = helpers.createLogger(LOGID);
  }
  else {
    // this is a false positive that happens in jest tests
    log = mockLog;
  }
  logInitialized = true;
}


/**
 * Loads an object of values into the config.
 * @param {any} settings
 */
function loadConfig(settings) {
  initLog();
  loadDepth = 0;
  loadOver(settings, myConfig);
  return myConfig;
}


function loadOver(newVals, targetObject) {
  var otype = typeof (newVals);
  var k, v, vtype;
  var next;
  if (loadDepth++ > 7) {
    log.warn('DigiTrust load config over recurse page: ' + document.location);
    return targetObject;
  }
  if (otype != 'object' || newVals == null) {
    return targetObject;
  }

  for (k in newVals) {
    if (newVals.hasOwnProperty(k)) {
      v = newVals[k];
      vtype = typeof (v);
      if (vtype == 'object') {
        if (targetObject[k] == null) {
          targetObject[k] = {};
        }
        next = targetObject[k]
        targetObject[k] = loadOver(v, next);
        loadDepth--;
      }
      else {
        targetObject[k] = v;
      }
    }
  }

  return targetObject;
}

function reset() {
  myConfig = null;
  setBaseConfig();
}

function setBaseConfig() {
  var conf = Object.assign({}, genConfig['prod']);
  myConfig = conf
  // merge in activeConfig
  if (buildEnv != 'prod') {
    loadConfig(activeConfig);
  }
  return myConfig;
}

/**
 * Gets a value from the config based upon a key.
 * Key can be of format keyA.keyB.keyX
 * @param {string} key
 */
function getVal(key) {
  return helpers.deepGet(myConfig, key);
}

setBaseConfig();

module.exports = {
  loadConfig: loadConfig,
  getValue: getVal,
  reset: reset,
  all: function () { return myConfig; }
}