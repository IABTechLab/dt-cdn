'use strict';

/**
 * Communication Test Spec
 * @module
 * Exercise the communication related components of digitrust.
 * */


var psFactory = require('../../src/modules/MinPubSub');
var consts = require('../../src/config/constants.json');



describe('PubSub test', function () {
    it('Should register and respond to a new message', function () {
        var pubsub = psFactory.createPubSub();
        var callcount = 0;
        var t = 'mytest';
        pubsub.subscribe(t, function () {
            callcount++;
        });

        expect(callcount).toBe(0);
        pubsub.publish(t);
        expect(callcount).toBe(1);

    });

    it('Should unregister listeners', function () {
        var pubsub = psFactory.createPubSub();
        var callcount = 0;
        var t = 'mytest';
        var fn = function () {
            callcount++;
        };

        pubsub.subscribe(t, fn);

        expect(callcount).toBe(0);
        pubsub.publish(t);
        pubsub.publish(t);
        expect(callcount).toBe(2);
        pubsub.unsubscribe(t, fn);
        pubsub.publish(t);
        expect(callcount).toBe(2);
    });

    it('Should recognize multiple listeners', function () {
        var pubsub = psFactory.createPubSub();
        var callcount = 0;
        var t = 'mytest';
        var fn = function () {
            callcount++;
        };
        var fn2 = function () {
            callcount += 3;
        };

        pubsub.subscribe(t, fn);
        expect(callcount).toBe(0);
        pubsub.publish(t);
        expect(callcount).toBe(1);

        pubsub.subscribe(t, fn2);
        pubsub.publish(t);

        expect(callcount).toBe(5);
        pubsub.unsubscribe(t, fn);
        pubsub.publish(t);
        expect(callcount).toBe(8);
    });
    it('Should recognize different topics', function () {
        var pubsub = psFactory.createPubSub();
        var callcount = 0;
        var t = 'mytest';
        var t2 = 'foo'
        var fn = function () {
            callcount++;
        };
        var fn2 = function () {
            callcount += 3;
        };

        pubsub.subscribe(t, fn);
        expect(callcount).toBe(0);
        pubsub.publish(t);
        expect(callcount).toBe(1);

        pubsub.subscribe(t2, fn2);
        pubsub.publish(t2);

        expect(callcount).toBe(4);
    });
});
