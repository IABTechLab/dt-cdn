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
  expect(helpers.isEmpty(val)).toBeFalsy;
});

test('isEmpty true for empty literal', () => {
  expect(helpers.isEmpty({})).toBeTruthy;
});

test('isEmpty true for empty Object', () => {
  expect(helpers.isEmpty(new Object())).toBeTruthy;
});

test('isEmpty true for null', () => {
  expect(helpers.isEmpty(null)).toBeTruthy;
});

test('isEmpty true for undefined', () => {
  var x;
  expect(helpers.isEmpty(x)).toBeTruthy;
});
test('isEmpty true for array', () => {
  expect(helpers.isEmpty([])).toBeTruthy;
});
test('isEmpty false for filled array', () => {
  expect(helpers.isEmpty(['b','a'])).toBeTruthy;
});



