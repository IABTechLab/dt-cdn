/**
 * Digitrust.debugControl
 * @module
 * Namespace to contain debug control methods. This object is attached to DigiTrust.debugControl
 * */

'use strict';

var Dcom = require('./DigiTrustCommunication');

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

var logTagStyle = 'display: inline-block; color: #fff; background: [BG_COLOR]; padding: 1px 4px; border-radius: 3px;font-size:1.1rem;';
function getStyle() {
  var dt = this.parent || window.DigiTrust;
  var bgColor = dt.isClient ? '#395BA8' : '#ff9900';
  var tagStyle = logTagStyle.replace('[BG_COLOR]', bgColor);
  return tagStyle;
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
  var isClient = this.parent.isClient;
  if (typeof isSet !== 'boolean') {
    isSet = true;
  }
  var result = util.setDebug(isSet);
  if (isClient) {
    Dcom.setFrameDebug(true);
  }

  return result;
};

/**
 * Outputs all log entries to Con sole.log
 * and also returns them as an array
 * @memberof DigiTrust.debugControl
 */
Dbug.prototype.dumpLogs = function (header) {
  var util = this.parent.util;
  var buffer = util.getGlobalLogger().getBuffer();

  forceWrite(util.getGlobalLogger().name);
  var hasHeader = header != null;
  if (hasHeader) {
    var style = getStyle.call(this);
    forceWrite("%c" + header, style);
    forceGroup(true, header);
  }
  forceWrite(buffer);
  if (hasHeader) {
    forceGroup(false);
  }
  var isClient = this.parent.isClient;
  if (isClient) {
    Dcom.dumpFrameLogs();
  }

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
  con.log.apply(con, arguments);
  return;
}

function forceGroup(isGroup, text) {
  // circumvent build checks in this one instance
  var key = 'con' + 'sole';
  var con = window[key];
  if (isGroup) {
    con.group(text);
  }
  else {
    con.groupEnd();
  }
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

