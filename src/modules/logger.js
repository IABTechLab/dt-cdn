/*
* Logger sets logging methods for code
*
*
*/


'use strict'

// Default log level
var DEF_LOGLEVEL = "ERROR";


var logLevels = {
		"DEBUG":   {val: 0, log: 'log'},
		"INFO":    {val: 1, log: 'log'},		
		"WARN":    {val: 2, log: 'warn'},
		"ERROR":   {val: 3, log: 'error'},
		"LOG": {val: 99, log: 'log'}
}

var logLevelsByNum = [
	logLevels.DEBUG,
	logLevels.INFO,
	logLevels.WARN,
	logLevels.ERROR,
	logLevels.LOG
];

/**
* @function
* Return a numeric value for the level
* @return {number} mapped numeric value or the "ERROR" level value
*/
function getLevelVal(level) {
  var ltype = typeof (level);
  var lvl;
  if (ltype === 'string') {
    lvl = logLevels[level];
  }
  else if (ltype === 'number') {
    lvl = logLevelsByNum[level];
  }
  else {
    return 3;
  }

	if(lvl == null){
		return 3;
	}
	return lvl.val;
}

function getLevelObject(level){
	var numVal = -1;
	if(typeof(level) === 'string'){
		numVal = getLevelVal(level);
	}
	
	return logLevelsByNum[numVal];
}

/**
* @function
* Convert obj into an array
*/
function toArray(obj){
	var arr = [];
	var val;
	var i;
	if(obj == null){
		return arr;
	}
	if((typeof(obj) === 'object') && obj.length == null){
		arr.push(obj);
		return arr;
	}
	for(i=0;i<obj.length;i++){
		val = obj[i];
		if(val != undefined){
			arr.push(val);
		}
	}
	return arr;
}

// expected methods on a console object
var consoleMethods = ['info', 'debug', 'warn', 'error', 'trace'];
var noop = function () { };
var isFunc = function (fn) { return typeof (fn) === 'function' };

/**
 * Adds any missing methods to the passed console implementation
 * 
 * @param {any} obj
 */
function insureValidConsole(obj) {
  if (!isFunc(obj.log)) {
    obj.log = noop;
  }
  var cm = consoleMethods;
  var i;
  for (i = 0; i < cm.length; i++) {
    if (!isFunc(obj[cm[i]])) {
      obj[cm[i]] = obj.log;
    }
  }
}

/**
* @class
* The class definition for a new logger. This is created with the factory method "createLogger"
*/
function Logger(){

	this.name = 'Logger'
	this.opts = { level: DEF_LOGLEVEL };
	this.enabled = true;
	var passedArgs = toArray(arguments);
	var me = this;

  // wrap the console so we can override
  var consoleWrapper = console;

	/**
	* @function
	* Substitute the default console for a custom object
	*/
  this.setConsoleObj = function (obj) {
    insureValidConsole(obj);
    consoleWrapper = obj;
  };

	// Initializer method
	(function(args){
		var args = args || [];
		var i, val, valType;
		if(args.length == 0){
			return;
		}
		
		for(i=0;i<args.length;i++){
			val = args[i];
			valType = typeof(val);
			if(valType === 'string'){
				me.name = val;
			}else if(valType == 'object'){
				me.opts = val;
				if(val.name != null){
					me.name = val.name;
				}
				if(val.level == null){
					val.level = DEF_LOGLEVEL;
        }
        if (val.console != null) {
          me.setConsoleObj(val.console);
        }
			}
		}
	})(passedArgs);
	
	/**
	* @function
	* Test to see if provided level should be logged
	* given the configured level
	*/
	function doLog(level){
		var lvl = logLevels[level];
		var level = (lvl && lvl.val) || 0;
		var myLevel = getLevelVal(me.opts.level);

    console.log('---LEVEL CHECH --- MINE: ' + myLevel + ' ASK: ' + level);
    console.table(level);
		return (level >= myLevel);
  }

	/**
	* @function
	* Central method for writing the log value
	*/
	this.log = function(){
		var args = toArray(arguments);
		var msg, lvlArg;
		var logIt = true;
		var levelDef = logLevels.LOG;
		var doTrace = false;
		var i;
		
		if(this.enabled != true){
			return;
    }
		
		if(args.length >= 2){
			if(typeof(args[args.length - 1]) === 'string'){
				lvlArg = args.pop();
				logIt = doLog(lvlArg);
				levelDef = logLevels[lvlArg];
			}
			else if(typeof(args[args.length - 1]) === 'number'){
				lvlArg = args.pop();
				logIt = (lvlArg >= getLevelVal(me.opts.level));
				levelDef = logLevelsByNum[lvlArg];
			}
		}

		if(!logIt){
			return;
		}
		
		if(!levelDef){ levelDef = logLevels.LOG; }
		
		if(args.length == 0){
			msg = this.name + ": [no message]";			
		}
		else if(typeof(args[0]) === 'string'){
			msg = this.name + ': ' + args.shift();
		}
		else{
			msg = this.name;
		}
		
		args.unshift(msg);
		doTrace = (levelDef.val == logObj.WARN || levelDef.val == logObj.ERROR);
		if(doTrace || levelDef.val == logObj.DEBUG){
			args.push({ page: document.location.href });
		}

    var result;
    var cw = consoleWrapper;
		if(cw[levelDef.log]){
      result = cw[levelDef.log].apply(null, args);
		}
		else{
      result = cw.log.apply(null, args);
		}
    if (doTrace && cw.trace){
      cw.trace();
    }

    return result;
	}
}

/**
* @function
* Change the internal log level after initialization
*/
Logger.prototype.setLogLevel = function (level) {
  var lvlType = typeof (level);
  var lvlObj;
  if (lvlType === 'string') {
    this.opts.level = level;
  }
  else if (lvlType === 'number') {
    lvlObj = logLevelsByNum[level];
    if (lvlObj) {
      try {
        this.opts.level = lvlObj.log.toUpperCase();
      }
      catch (ex) { }
    }
  }
}

Logger.prototype.getLevels = function(){
	return logLevels;
}

Logger.prototype.debug = function(){
	var args = toArray(arguments);
	args.push(logObj.DEBUG);
  return this.log.apply(this, args);
}
Logger.prototype.info = function(){
	var args = toArray(arguments);
	args.push(logObj.INFO);
  return this.log.apply(this, args);
}
Logger.prototype.warn = function(){
  var args = toArray(arguments);
  args.push(logObj.WARN);
	return this.log.apply(this, args);
}
Logger.prototype.error = function(){
	var args = toArray(arguments);
	args.push(logObj.ERROR);
  return this.log.apply(this, args);
}

var logObj = {
	createLogger: function(){
	    return new Logger(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
	},
	DEBUG: 0,
	INFO: 1,
	WARN: 2,
	ERROR: 3
};

module.exports = logObj;

