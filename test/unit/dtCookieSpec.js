'use strict';

/**
 * Cookie Test Spec
 * @module
 * Exercise the cookie methods of digitrust.
 * */

var dtCookie = require('../../src/modules/DigiTrustCookie');
var consts = require('../../src/config/constants.json');
var env = require('../../src/config/env.json').current;
var configGeneral = require('../../src/config/general.json')[env];


describe('Cookie transform tests', function () {

    beforeAll(function (done) {
        document.cookie = configGeneral.cookie.publisher.userObjectKey
            + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = configGeneral.cookie.digitrust.userObjectKey
            + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        done();
    });
    

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

    it('DigiTrustCookie.unobfuscateCookieValue() on malformed data', function () {
        // set a bad identity cookie
        var cookieKey = configGeneral.cookie.digitrust.userObjectKey;
        var cookieExpires = new Date();
        cookieExpires.setTime(cookieExpires.getTime() + 60000);
        document.cookie = cookieKey + '=foobared; expires=' + cookieExpires.toUTCString() + ';path=/;';
        var user = dtCookie.getIdentityCookieJSON(cookieKey);
        // we should have generated a new value
        expect(user.id).not.toBe(null);
        expect(user.version).toBe(2);
        expect(user.producer).toBe(configGeneral.cookie.producer);
        expect(user.privacy.optout).toBe(false);
    });
    it('DigiTrustCookie.optoutCookieValue()', function () {
        var identity = dtCookie.unobfuscateCookieValue
            ('eyJpZCI6bnVsbCwia2V5diI6MCwicHJpdmFjeSI6eyJvcHRvdXQiOnRydWV9fQ%3D%3D');
        expect(identity).toEqual({ id: null, keyv: 0, privacy: { optout: true } });
    });
    it('DigiTrustCookie.verifyPublisherDomainCookie()', function () {
        expect(dtCookie.verifyPublisherDomainCookie({})).toBe(false);
        expect(dtCookie.verifyPublisherDomainCookie({ id: 'abc' })).toBe(false);
        expect(dtCookie.verifyPublisherDomainCookie({
            id: 'abc', version: 2,
            privacy: { optout: false }
        })).toBe(false);
        expect(dtCookie.verifyPublisherDomainCookie({
            id: 'abc', version: 2,
            keyv: 4, privacy: { optout: false }
        })).toBe(true);
    });


});

