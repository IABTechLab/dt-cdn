

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
});
