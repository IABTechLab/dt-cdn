'use strict';

/**
 * ConfigLoader
 * @module
 * 
 * @description Centralizes loading and access of configuration values to reduce duplication.
 * @author Chris Cole
 * 
 * */

var env = require('../config/env.json').current;
var configGeneral = require('../config/general.json')[env];


function loadConfig(settings) {

}


module.exports = {
  loadConfig: loadConfig
}