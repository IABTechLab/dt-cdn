'use strict';

/**
 * @class MinPubSub
 * 
 * @classdesc A simple publish/subscribe class for passing postMessage messages between frames.
 * 
 * Adapted from https://github.com/daniellmb/MinPubSub
 * */


function MinPubSub(options) {
    var cache = window.c_ || {}; // check for 'c_' cache for unit testing
    var me = this;

    this.publish = function (topic, args) {
        var subs = cache[topic];
        var len = subs ? subs.length : 0;

        while (len--) {
            subs[len].apply(window, args || []);
        }
    };

    this.subscribe = function (topic, callback) {
        if (!cache[topic]) {
            cache[topic] = [];
        }
        cache[topic].push(callback);
        return [topic, callback];
    };

    this.unsubscribe = function (handle, callback) {

        var subs = cache[callback ? handle : handle[0]];
        callback = callback || handle[1];
        var len = subs ? subs.length : 0;

        while (len--) {
            if (subs[len] === callback) {
                subs.splice(len, 1);
            }
        }
    };
}


module.exports = {
    createPubSub: function (opts) {
        return new MinPubSub(opts);
    }
}



