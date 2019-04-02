

var DigiTrust = require('../../src/modules/DigiTrust');
window.DigiTrust = DigiTrust;
var helpers = require('../../src/modules/helpers');
var env = require('../../src/config/env.json').current;


describe('helpers', function () {

  it('isEmpty null is true', function () {
    expect(helpers.isEmpty(null)).toBe(true);
  });

  it('isEmpty undefined is true', function () {
    expect(helpers.isEmpty()).toBe(true);
  });

  it('isEmpty string is false', function () {
    expect(helpers.isEmpty("foo")).toBe(false);
  });
  it('isEmpty empty object is true', function () {
    expect(helpers.isEmpty(new Object())).toBe(true);
  });
  it('isEmpty empty object literal is true', function () {
    expect(helpers.isEmpty({})).toBe(true);
  });
  it('isEmpty valid object is false', function () {
    expect(helpers.isEmpty({ x: "foo" })).toBe(false);
  });
  it('isEmpty number is true', function () {
    expect(helpers.isEmpty(9)).toBe(true);
  });

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
