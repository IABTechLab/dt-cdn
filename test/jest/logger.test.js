const logger = require('../../src/modules/logger');

test('can create logger', () => {
  let log = logger.createLogger('testLogger');
  let levels = log.getLevels();
  expect(levels).toBeTruthy();
  expect(levels['DEBUG'].val).toBe(0);
  expect(levels['INFO'].val).toBe(1);
  expect(levels['ERROR'].log).toBe('error');
  expect(log.name).toBe('testLogger');
});

