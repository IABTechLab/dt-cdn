'use strict';

/**
 * Cookie Test Spec
 * @module
 * Exercise the cookie methods of digitrust.
 * */

var dtCookie = require('../../src/modules/DigiTrustCookie');
var consts = require('../../src/config/constants.json');


describe('Cookie transform tests', function () {
    it('Should encode and decode a cookie value', function () {
        var testval = "HELLO WORLddd";
        // console.log(dtCookie);
        var obs = dtCookie.obfuscateCookieValue(testval);
        expect(obs == testval).toBeFalsy();

        var back = dtCookie.unobfuscateCookieValue(obs);
        expect(back == testval).toBeTruthy();
    });

    it('Should write and expire a cookie', function () {
        var ck = 'mycookie';
        var before = dtCookie.getCookieByName(ck);

        expect(before == null).toBeTruthy();
        var c = ck + '=' + 'some_value';
        document.cookie = c;

        var after = dtCookie.getCookieByName(ck);
        expect(after == 'some_value').toBeTruthy();

        dtCookie.expireCookie(ck);
        var atend = dtCookie.getCookieByName(ck);

        expect(atend == undefined).toBeTruthy();

    });

});

