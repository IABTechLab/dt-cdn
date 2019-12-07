/**
 * Digitrust.debug
 * @module
 * Debug control methods. This object is attached to DigiTrust.debug
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
 * Outputs all log entries to Console.log
 * and also returns them as an array
 * @memberof DigiTrust.debugControl
 */
Dbug.prototype.dumpLogs = function () {
  var util = this.parent.util;
  return util.getGlobalLogger().getBuffer();
};



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

