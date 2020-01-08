const config = require('../../src/modules/ConfigLoader');
const generalConfig = require('../../src/config/GeneralConfig');

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


test('version Calculations with base only', () => {
  var baseVersion = "1.5.31";

  var result = generalConfig.computeVersions(baseVersion);

  expect(result.current).toBe(baseVersion);
  expect(result.prior).toBe("1.5.30");

});

