/*
 * Digitrust Client-side base module.
 * This is the root JS file for building the dependency tree and assigning to the global Window object.
 * Copyright 2015-2018 IAB Tech Lab. All rights reserved.
 * 
 * @license
 * This code is licensed and distributed under the Apache 2.0 license.
 * Please see license.txt file for full text.
 * 
 */ 
var DigiTrust = require('./modules/DigiTrust');

if (window !== undefined && window.DigiTrust == null) {
    window.DigiTrust = DigiTrust;
}
