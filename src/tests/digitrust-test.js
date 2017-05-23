var DigiTrust = require('../modules/DigiTrust');
window.DigiTrust = DigiTrust;
var DigiTrustAdblock = require('../modules/DigiTrustAdblock');
var DigiTrustCommunication = require('../modules/DigiTrustCommunication');
var DigiTrustPopup = require('../modules/DigiTrustPopup');
var DigiTrustCookie = require('../modules/DigiTrustCookie');
var helpers = require('../modules/helpers');
var env = require('../config/env.json').current;
var configGeneral = require('../config/general.json')[env];

describe('DigiTrust.getUser', function () {

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

describe('DigiTrustAdblock', function () {

    /*it('DigiTrustAdblock.checkEndpoint', function () {
        var getUserResult = DigiTrustAdblock.checkEndpoint();
        expect(getUserResult.success).toBe(false);
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
    it('DigiTrustCookie.optoutCookieValue()', function () {
        var identity = DigiTrustCookie.unobfuscateCookieValue
            ('eyJpZCI6bnVsbCwia2V5diI6MCwicHJpdmFjeSI6eyJvcHRvdXQiOnRydWV9fQ%3D%3D');
        expect(identity.id).toBe(null);
        expect(identity.keyv).toBe(0);
        expect(identity.privacy.optout).toBe(true);
    });
    /*it('getUser without member id', function () {
        var getUserResult = DigiTrust.getUser({
            synchronous: true
        });
        expect(getUserResult.success).toBe(false);
    });*/
});

describe('DigiTrustPopup', function () {

    var configInitializeOptions = {
        adblocker: {
            userMessage: 'foobar',
            popupFontColor: 'white',
            popupBackgroundColor: 'orange'
        },
        consent: {
            userMessage: 'cookies_cookies',
            popupFontColor: 'white',
            popupBackgroundColor: 'black'
        }
    };

    it('DigiTrustPopup.createAdblockPopup', function () {
        DigiTrustPopup.createAdblockPopup(configInitializeOptions);

        expect(document.getElementById('digitrust-adb-bg').id)
            .toEqual('digitrust-adb-bg');
        expect(document.getElementById('digitrust-adb-reload').innerHTML)
            .toContain('RELOAD THE PAGE');
        expect(document.getElementById(configGeneral.htmlIDs.dtAdbMessage).innerHTML)
            .toContain(configInitializeOptions.adblocker.userMessage);
        expect(document.getElementById(configGeneral.htmlIDs.dtAdbContainer).style.background)
            .toEqual(configInitializeOptions.adblocker.popupBackgroundColor);
        expect(document.getElementById(configGeneral.htmlIDs.dtAdbContainer).style.color)
            .toEqual(configInitializeOptions.adblocker.popupFontColor);
        expect(document.getElementById('digitrust-adb-blur').id)
            .toBeTruthy();
    });

    it('DigiTrustPopup.createConsentPopup', function () {
        DigiTrustPopup.createConsentPopup(configInitializeOptions);

        expect(document.getElementById(configGeneral.htmlIDs.consentLinkId).innerHTML)
            .toContain('You can read more or opt out of DigiTrust here.');
        expect(document.getElementById('digitrust-c-text').id)
            .toBeTruthy();
        expect(document.getElementById('digitrust-c-info').id)
            .toBeTruthy();
        expect(document.getElementById('digitrust-c-bg').style.background)
            .toEqual(configInitializeOptions.consent.popupBackgroundColor);
        expect(document.getElementById('digitrust-c-bg').style.color)
            .toEqual(configInitializeOptions.consent.popupFontColor);
    });
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
});
