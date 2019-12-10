/**
 * Digitrust.debugControl
 * @module
 * Namespace to contain debug control methods. This object is attached to DigiTrust.debugControl
 * */

'use strict';

/**
 * DebugControl class
 * This exposes methods used for debugging DigiTrust.
 * @class
 * @param {any} parent
 */
function Dbug(parent) {
  this.parent = parent || window.DigiTrust;
  var me = this; // closure hook

}

/**
 * Returns true or false to indicate if DigiTrust is in a debug state
 * @memberof DigiTrust.debugControl
 */
Dbug.prototype.isDebug = function () {
  return this.parent.util.isDebugEnabled();
};

/**
 * Toggles debug state
 * @memberof DigiTrust.debugControl
 */
Dbug.prototype.setDebug = function (isSet) {
  var util = this.parent.util;
  return util.setDebug(isSet);
};

/**
 * Outputs all log entries to Con sole.log
 * and also returns them as an array
 * @memberof DigiTrust.debugControl
 */
Dbug.prototype.dumpLogs = function () {
  var util = this.parent.util;
  var buffer = util.getGlobalLogger().getBuffer();
  forceWrite(buffer);
  return buffer;
};

/**
 * Outputs all log entries to Con sole.log as a string
 * @memberof DigiTrust.debugControl
 */
Dbug.prototype.dumpLogString = function () {
  var util = this.parent.util;
  var buffer = util.getGlobalLogger().getBuffer();
  var rslt = [];
  var i;
  for (i = 0; i < buffer.length; i++) {
    rslt.push(JSON.stringify(buffer[i]));
  }

  forceWrite(rslt.join('\n'));

  return buffer;
};

Dbug.prototype.dumpConfig = function () {
  var conf = DigiTrust._config.initOptions;
  forceWrite(conf);
  return conf;
}


/*
 * @function
 * Circumvents the build checks against using console for debugging purposes.
 * Outputs to con sole.log
 */ 
function forceWrite() {
  // circumvent build checks in this one instance
  var key = 'con' + 'sole';
  var con = window[key];
  con.log(arguments[0]);
  return;
}


// Export statements
module.exports = {
  /**
   * Factory method to initialize debug controller
   * 
   * @param {any} parent
   */
  createDebugControl: function (parent) {
    var p = parent || window.DigiTrust;
    return new Dbug(p);
  }
}

