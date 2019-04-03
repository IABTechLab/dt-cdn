

var util = require('../../src/dtFrame/frameUtils');

describe('frame Utils', function () {

  it('isEmpty null is true', function () {
    expect(util.isEmpty(null)).toBe(true);
  });

  it('isEmpty undefined is true', function () {
    expect(util.isEmpty()).toBe(true);
  });

  it('isEmpty string is false', function () {
    expect(util.isEmpty("foo")).toBe(false);
  });
  it('isEmpty empty object is true', function () {
    expect(util.isEmpty(new Object())).toBe(true);
  });
  it('isEmpty empty object literal is true', function () {
    expect(util.isEmpty({})).toBe(true);
  });
  it('isEmpty valid object is false', function () {
    expect(util.isEmpty({ x: "foo" })).toBe(false);
  });
  it('isEmpty number is true', function () {
    expect(util.isEmpty(9)).toBe(false);
  });

  it('generateUserId', function () {
    // generate an id
    var id = util.generateUserId();
    expect(id).toBeDefined();
    var binaryId = util.decodeToArrayBuffer(id);
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
    expect(id).toBe(util.encodeArrayBuffer(binaryId));
  });
});
