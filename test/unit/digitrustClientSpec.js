

var DigiTrust = require('../../src/modules/DigiTrust');
window.DigiTrust = DigiTrust;
var DigiTrustCommunication = require('../../src/modules/DigiTrustCommunication');
var DigiTrustCookie = require('../../src/modules/DigiTrustCookie');
var DigiTrustCrypto = require('../../src/modules/DigiTrustCrypto');
var helpers = require('../../src/modules/helpers');
var env = require('../../src/config/env.json').current;
var configGeneral = require('../../src/config/general.json')[env];


describe('Fake test to init', function(){
	it('Should init with an addition problem', function(){
		expect(2).toBe(2);
	});
	
	it('Should init compare strings', function(){
		expect('a').toBe('a');
	});
});

describe('DigiTrust.getUser', function () {

    beforeAll(function (done) {
        document.cookie = configGeneral.cookie.publisher.userObjectKey
            + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = configGeneral.cookie.digitrust.userObjectKey
            + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        done();
    });

    it('DigiTrust.initialize without member id', function (done) {
        DigiTrust.initialize({
            member: null
        },
        function (identityResponse) {
            expect(identityResponse.success).toBe(false);
            done();
        });
    });

    it('DigiTrust.getUser without member id', function (done) {
        var getUserResult = DigiTrust.getUser({
            member: null
        });
        expect(getUserResult.success).toBe(false);
        done();
    });
});

describe('DigiTrust.initialize() sample rate 0', function () {

    it('DigiTrust.initialize() fails immediately with sample rate of 0', function (done) {
        DigiTrust.initialize({
            member: 'foo',
            sample: 0
        },
        function (identityResponse) {
            expect(identityResponse.success).toBe(false);
            expect(document.getElementById(configGeneral.htmlIDs.consentLinkId))
                .toBe(null);
            done();
        });
    });
});

describe('DigiTrust.initialize() consent window default', function () {

    it('DigiTrust.initialize() defaults to no consent window', function (done) {
        DigiTrust.initialize({
            member: 'foo',
        },
        function (identityResponse) {
            expect(document.getElementById(configGeneral.htmlIDs.consentLinkId))
                .toBe(null);
            done();
        });
    });
});

describe('DigiTrust.initialize() consent window none', function () {

    it('DigiTrust.initialize() without consent window', function (done) {
        DigiTrust.initialize({
            member: 'foo',
            consent: {
                requires: 'none'
            }
        },
        function (identityResponse) {
            expect(document.getElementById(configGeneral.htmlIDs.consentLinkId))
                .toBe(null);
            done();
        });
    });
});

describe('DigiTrust.initialize() consent window implicit', function () {

    it('DigiTrust.initialize() with consent window', function (done) {
        DigiTrust.initialize({
            member: 'foo',
            consent: {
                requires: 'implicit'
            }
        },
        function (identityResponse) {
            expect(document.getElementById(configGeneral.htmlIDs.consentLinkId))
                .toBe(null);
            done();
        });
    });
});

describe('DigiTrust.initialize() undefined callback', function () {

    it('DigiTrust.initialize() with undefined callback', function (done) {
        DigiTrust.initialize({
            member: 'foo'
        });
        done();
    });
});

describe('DigiTrust.initialize() redirects false', function () {

    /*it('DigiTrust.initialize() does not rewrite links when redirects=false', function (done) {
        DigiTrust.initialize({
            member: 'foo',
            redirects: false
        },
        function (identityResponse) {
            expect(window.onclick).toBe(null);
            expect(document.getElementById(configGeneral.htmlIDs.consentLinkId))
                .toBe(null);
            done();
        });
    });*/
});

describe('DigiTrust.initialize() redirects true', function () {

    /*it('DigiTrust.initialize() does rewrite links when redirects=true', function (done) {
        DigiTrust.initialize({
            member: 'foo',
            redirects: true
        },
        function (identityResponse) {
            expect(window.onclick).not.toBe(null);
            expect(identityResponse.success).toBe(false);
            expect(document.getElementById(configGeneral.htmlIDs.consentLinkId))
                .toBe(null);
            done();
        });
    });*/
});

describe('DigiTrustCommunication', function () {

    /*it('getUser without member id', function () {
        var getUserResult = DigiTrust.getUser({
            synchronous: true
        });
        expect(getUserResult.success).toBe(false);
    });*/
});

describe('DigiTrustCookie', function () {

    beforeAll(function (done) {
        document.cookie = configGeneral.cookie.publisher.userObjectKey
            + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = configGeneral.cookie.digitrust.userObjectKey
            + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        done();
    });

    it('DigiTrustCookie.cookies', function () {
        var cookieKey = 'testcookie';
        var cookieValue = 'foobar';
        document.cookie = cookieKey + '=' + cookieValue + '; expires=Thu, 01 Jan 2037 00:00:00 UTC; path=/;';
        document.cookie = 'SomeOtherCookie=SomeOtherCookieValue; expires=Thu, 01 Jan 2037 00:00:00 UTC; path=/;';
        expect(DigiTrustCookie.getCookieByName(cookieKey)).toBe(cookieValue);
        DigiTrustCookie.expireCookie(cookieKey);
        if (env !== 'prod') {
            expect(DigiTrustCookie.getCookieByName(cookieKey)).toBeUndefined();
        }
    });
    it('DigiTrustCookie.createUserCookiesOnDigitrustDomain()', function () {
        var identity = DigiTrustCookie.createUserCookiesOnDigitrustDomain();
        expect(identity.id).not.toBe(null);
        expect(identity.version).toBe(2);
        expect(identity.producer).toBe(configGeneral.cookie.producer);
        expect(identity.privacy.optout).toBe(false);
    });
    it('DigiTrustCookie.obfuscateCookieValue()', function () {
        var identity = {
            id: null,
            keyv: 0,
            privacy: {
                optout: true
            }
        };
        var encodedUserIdentity = DigiTrustCookie.obfuscateCookieValue(identity);
        var identity2 = DigiTrustCookie.unobfuscateCookieValue(encodedUserIdentity);
        expect(identity2.keyv).toBe(0);
        expect(identity2.privacy.optout).toBe(true);
    });
    it('DigiTrustCookie.unobfuscateCookieValue() on malformed data', function () {
        // set a bad identity cookie
        var cookieKey = configGeneral.cookie.digitrust.userObjectKey;
        var cookieExpires = new Date();
        cookieExpires.setTime(cookieExpires.getTime() + 60000);
        document.cookie = cookieKey + '=foobared; expires=' + cookieExpires.toUTCString() + ';path=/;';
        var user = DigiTrustCookie.getIdentityCookieJSON(cookieKey);
        // we should have generated a new value
        expect(user.id).not.toBe(null);
        expect(user.version).toBe(2);
        expect(user.producer).toBe(configGeneral.cookie.producer);
        expect(user.privacy.optout).toBe(false);
    });
    it('DigiTrustCookie.optoutCookieValue()', function () {
        var identity = DigiTrustCookie.unobfuscateCookieValue
            ('eyJpZCI6bnVsbCwia2V5diI6MCwicHJpdmFjeSI6eyJvcHRvdXQiOnRydWV9fQ%3D%3D');
        expect(identity).toEqual({id: null, keyv: 0, privacy: {optout: true}});
    });
    it('DigiTrustCookie.verifyPublisherDomainCookie()', function () {
        expect(DigiTrustCookie.verifyPublisherDomainCookie({})).toBe(false);
        expect(DigiTrustCookie.verifyPublisherDomainCookie({id: 'abc'})).toBe(false);
        expect(DigiTrustCookie.verifyPublisherDomainCookie({id: 'abc', version: 2,
            privacy: {optout: false}})).toBe(false);
        expect(DigiTrustCookie.verifyPublisherDomainCookie({id: 'abc', version: 2,
            keyv: 4, privacy: {optout: false}})).toBe(true);
    });
    /*it('getUser without member id', function () {
        var getUserResult = DigiTrust.getUser({
            synchronous: true
        });
        expect(getUserResult.success).toBe(false);
    });*/
});

describe('helpers', function () {

    it('getAbsolutePath', function () {

        /*
            Since this runs in phantom, the base url should be: http://localhost:9876/
            The index page is: http://localhost:9876/context.html
        */

        expect(helpers.getAbsolutePath('http://example.com')).toBe('http://example.com/');
        expect(helpers.getAbsolutePath('https://www.exmaple.com')).toBe('https://www.exmaple.com/');
        expect(helpers.getAbsolutePath('//cdn.example.com/lib.js')).toBe('http://cdn.example.com/lib.js');
        expect(helpers.getAbsolutePath('/test')).toBe('http://localhost:9876/test');
        expect(helpers.getAbsolutePath('test')).toBe('http://localhost:9876/test');
        expect(helpers.getAbsolutePath('#test')).toBe('http://localhost:9876/context.html#test');
        expect(helpers.getAbsolutePath('../test')).toBe('http://localhost:9876/test');
    });

    it('generateUserId', function () {
        // generate an id
        var id = helpers.generateUserId();
        expect(id).toBeDefined();
        var binaryId = helpers.base64StringToArrayBuffer(id);
        expect(binaryId).not.toBe(null);
        expect(binaryId.byteLength).toBe(8);
        var a = new Uint8Array(binaryId);
        expect(a.length).toBe(8);
        // don't blame me that reduce() is not available in PhantomJS
        var total = 0;
        for (var i = 0; i < a.length; ++i) {
            total += a[i];
        }
        expect(total).not.toBe(0);
        // convert back to base64 string
        expect(id).toBe(helpers.arrayBufferToBase64String(binaryId));
    });
});
