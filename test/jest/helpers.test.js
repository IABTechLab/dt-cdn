const helpers = require('../../src/modules/helpers');

test('getAbsolutePath', () => {
  
  expect(helpers.getAbsolutePath('http://example.com')).toBe('http://example.com/');
  expect(helpers.getAbsolutePath('https://www.exmaple.com')).toBe('https://www.exmaple.com/');
  expect(helpers.getAbsolutePath('//cdn.example.com/lib.js')).toBe('http://cdn.example.com/lib.js');
  
  expect(helpers.getAbsolutePath('/test')).toBe('http://localhost/test');
  expect(helpers.getAbsolutePath('test')).toBe('http://localhost/test');
  expect(helpers.getAbsolutePath('#test')).toBe('http://localhost/#test');
  expect(helpers.getAbsolutePath('../test')).toBe('http://localhost/test');

});

test('urlParameter by name gets value', () => {
  var search = "?foo=bar&my=yours&a=b";

  expect(helpers.getUrlParameterByName('foo', search)).toBe('bar');
  expect(helpers.getUrlParameterByName('my', search)).toBe('yours');
  expect(helpers.getUrlParameterByName('a', search)).toBe('b');

});


test('extend adds to literal object', () => {
  var objA = {
    foo: 'bar'
  }
  var objB = {
    beep: function () { return 'honk honk' }
  };

  expect(objA.foo).toBe('bar');
  expect(objA.beep).toBeUndefined();
  expect(objB.beep()).toBe('honk honk');

  helpers.extend(objA, objB);
  expect(objA.beep()).toBe('honk honk');
})

test('extend generates an object', () => {
  var objA;

  var objB = {
    beep: function () { return 'honk honk' }
  };

  expect(objA).toBeUndefined();

  objA = helpers.extend(objA, objB);
  expect(objA.beep()).toBe('honk honk');
})

test('isEmpty handles an object', () => {
  var val = new Object();
  val.a = "b";
  expect(helpers.isEmpty(val)).toBeFalsy();
});

test('isEmpty true for empty literal', () => {
  expect(helpers.isEmpty({})).toBeTruthy();
});

test('isEmpty true for empty Object', () => {
  expect(helpers.isEmpty(new Object())).toBeTruthy();
});

test('isEmpty true for null', () => {
  expect(helpers.isEmpty(null)).toBeTruthy();
});

test('isEmpty true for undefined', () => {
  var x;
  expect(helpers.isEmpty(x)).toBe(true);
});
test('isEmpty true for array', () => {
  expect(helpers.isEmpty([])).toBe(true);
});
test('isEmpty false for filled array', () => {
  expect(helpers.isEmpty(['b','a'])).toBe(false);
});

test('validJson for invalid is false', () => {
  expect(helpers.isValidJSON('{"b": "a"')).toBe(false);
});

test('validJson for array is true', () => {
  expect(helpers.isValidJSON('["b", "a"]')).toBe(true);
});

test('validJson for object is true', () => {
  expect(helpers.isValidJSON('{"a": "b"}')).toBe(true);
});

test('round trips string to arraybuffer and back', () => {
  var val = "HELLO WORLD! I love you."
  var ab = helpers.str2ab(val);
  expect(val).not.toEqual(ab);
  var result = helpers.ab2str(ab);

  expect(result).toEqual(val);
});

// Browser sniffing
var uagent = {
  mac_safari: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9",
  iphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
  chrome: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36",
  android: "Mozilla/5.0 (Linux; Android 8.0.0; SM-G960F Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Mobile Safari/537.36",
  windows_edge: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246",
  windows_edge2: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; ServiceUI 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.18362",
  windows_ie: "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko",
  windows_ie2: "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; Touch; .NET4.0C; .NET4.0E; Tablet PC 2.0; wbx 1.0.0; rv:11.0) like Gecko"
}

test('finds IE but ignores Chrome', () => {
  expect(helpers.isIE(uagent.windows_ie)).toBe(true);
  expect(helpers.isIE(uagent.windows_ie2)).toBe(true);
  expect(helpers.isIE(uagent.chrome)).toBe(false);
});

test('finds Safari but ignores Chrome and IE', () => {
  expect(helpers.isSafari(uagent.mac_safari)).toBe(true);
  expect(helpers.isSafari(uagent.chrome)).toBe(false);
  expect(helpers.isSafari(uagent.android)).toBe(false);
  expect(helpers.isSafari(uagent.windows_ie2)).toBe(false);
});

test('finds iOS Safari', () => {
  expect(helpers.isSafari(uagent.iphone)).toBe(true);
});

test('isChrome ignores IE', () => {
  expect(helpers.isChrome(uagent.windows_ie)).toBe(false);
});
test('isChrome finds Chrome', () => {
  expect(helpers.isChrome(uagent.chrome)).toBe(true);
});
