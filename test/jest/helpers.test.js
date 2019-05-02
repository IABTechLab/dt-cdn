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



