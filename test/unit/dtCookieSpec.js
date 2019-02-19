'use strict';

/**
 * Cookie Test Spec
 * @module
 * Exercise the cookie methods of digitrust.
 * */

var DigiTrustCookie = require('../../src/modules/DigiTrustCookie');
var cookieConfig = require('../../src/config/cookie.json');
var dtCookie = require('../../src/modules/DigiTrustCookie');
var consts = require('../../src/config/constants.json');
var env = require('../../src/config/env.json').current;


describe('Cookie transform tests', function () {

    beforeAll(function (done) {
        document.cookie = cookieConfig.publisher.userObjectKey
            + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = cookieConfig.digitrust.userObjectKey
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
  
    it('DigiTrustCookie.unobfuscateCookieValue() on malformed data', function () {
        // set a bad identity cookie
        var cookieKey = cookieConfig.digitrust.userObjectKey;
        var cookieExpires = new Date();
        cookieExpires.setTime(cookieExpires.getTime() + 60000);
        document.cookie = cookieKey + '=foobared; expires=' + cookieExpires.toUTCString() + ';path=/;';
        var user = dtCookie.getIdentityCookieJSON(cookieKey);
        // we should have generated a new value
        expect(user.id).not.toBe(null);
        expect(user.version).toBe(2);
        expect(user.producer).toBe(cookieConfig.producer);
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

describe('DigiTrustCookie', function () {

  beforeAll(function (done) {
    document.cookie = cookieConfig.publisher.userObjectKey
      + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = cookieConfig.digitrust.userObjectKey
      + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    DigiTrust.initialize(
      {
        member: 'foo',
        consent: {
          requires: 'none'
        }
      },
      function (identityResponse) {
        done();
      }
    )
  });


  it('DigiTrustCookie.createUserCookiesOnDigitrustDomain()', function () {
    var identity = DigiTrustCookie.createUserCookiesOnDigitrustDomain();
    expect(identity.id).not.toBe(null);
    expect(identity.version).toBe(2);
    expect(identity.producer).toBe(cookieConfig.producer);
    expect(identity.privacy.optout).toBe(false);
  });
});
