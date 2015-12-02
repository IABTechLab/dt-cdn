var DigiTrust = require('../modules/DigiTrust');
window.DigiTrust = DigiTrust;
var DigiTrustAdblock = require('../modules/DigiTrustAdblock');
var DigiTrustCommunication = require('../modules/DigiTrustCommunication');
var DigiTrustPopup = require('../modules/DigiTrustPopup');
var DigiTrustCookie = require('../modules/DigiTrustCookie');
var helpers = require('../modules/helpers');
var env = require('../config/env.json').current;
var configGeneral = require('../config/general.json')[env];

describe('DigiTrust', function () {

    it('DigiTrust.initialize without memebr id', function (done) {
        DigiTrust.initialize({
            member: null
        },
        function (identityResponse) {
            expect(identityResponse.success).toBe(false);
            done();
        });
    });

    it('DigiTrust.getUser without memebr id', function () {
        var getUserResult = DigiTrust.getUser({
            member: null
        });
        expect(getUserResult.success).toBe(false);
    });

});

describe('DigiTrustAdblock', function () {

    /*it('DigiTrustAdblock.checkEndpoint', function () {
        var getUserResult = DigiTrustAdblock.checkEndpoint();
        expect(getUserResult.success).toBe(false);
    });*/
});

describe('DigiTrustCommunication', function () {

    /*it('getUser without memebr id', function () {
        var getUserResult = DigiTrust.getUser({
            synchronous: true
        });
        expect(getUserResult.success).toBe(false);
    });*/
});

describe('DigiTrustCookie', function () {

    /*it('getUser without memebr id', function () {
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
            .toContain('Reload Page');
        expect(document.getElementById('digitrust-adb-message').innerHTML)
            .toContain(configInitializeOptions.adblocker.userMessage);
        expect(document.getElementById('digitrust-adb-message').style.background)
            .toEqual(configInitializeOptions.adblocker.popupBackgroundColor);
        expect(document.getElementById('digitrust-adb-message').style.color)
            .toEqual(configInitializeOptions.adblocker.popupFontColor);
        expect(document.getElementById('digitrust-adb-blur').id)
            .toBeTruthy();
    });

    it('DigiTrustPopup.createConsentPopup', function () {
        DigiTrustPopup.createConsentPopup(configInitializeOptions);

        expect(document.getElementById(configGeneral.consent.consentLinkId).innerHTML)
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
