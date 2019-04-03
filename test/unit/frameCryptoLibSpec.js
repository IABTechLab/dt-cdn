

var cryptoLib = require('../../src/dtFrame/cryptoLib');
var util = require('../../src/dtFrame/frameUtils');

describe('cryptoLib Frame Tests', function () {


  it('generateUserId', function () {
    // generate an id
    var id = cryptoLib.generateUserId();
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
