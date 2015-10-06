'use strict';

var atomic = require('./atomic');

var DigiTrust = function () {};

var checkAdBlock = function () {

    var url = 'http://anvil.rubiconproject.com/a/api/market.js?' +
        '&account_id=10438&site_id=22410&zone_id=97122&cb=oz_onValuationLoaded_97122_15&size_id=15';
    // var url = 'http://localhost:8000/404.php';

    var getAdserver = atomic.get(url);

    if (!getAdserver.status) {
        // adblocker enabled
    } else {
        // adblocker disabled
    }
};

DigiTrust.initialize = function (options) {
    checkAdBlock();
};

module.exports = DigiTrust;
