const logger = require('../../src/modules/logger');

test('can create logger', () => {
  let log = logger.createLogger('testLogger');
  let levels = log.getLevels();
  expect(levels).toBeTruthy();
  expect(levels.length).toBe(5);
  expect(log.name).toBe('testLogger');
})


