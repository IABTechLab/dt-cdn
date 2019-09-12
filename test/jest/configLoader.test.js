const config = require('../../src/modules/ConfigLoader');

beforeEach(() => {
  config.reset();
});

test('config get a deep value', () => {
  let val = config.getValue("cookie.version");
  expect(val).toBe(2);
});

test('load-new-config', () => {
  config.reset();
  var val = config.getValue("cookie.version");
  expect(val).toBe(2);
  config.loadConfig({
    cookie: {
      version: 5
    }
  });

  val = config.getValue("cookie.version");
  expect(val).toBe(5);

});


