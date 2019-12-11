const logger = require('../../src/modules/logger');

beforeAll(() => {
  if (!window.DigiTrust) {
    window.DigiTrust = { isClient: true, version: '1.0.mock' };
  }
});

test('can create logger', () => {
  let log = logger.createLogger('testLogger');
  let levels = log.getLevels();
  expect(levels).toBeTruthy();
  expect(levels['DEBUG'].val).toBe(0);
  expect(levels['INFO'].val).toBe(1);
  expect(levels['ERROR'].val).toBe(3);
  expect(levels['ERROR'].log).toBe('error');
  expect(log.name).toBe('testLogger');
});

test('create logger has default name', () => {
  let log = logger.createLogger();
  expect(log.name).toBe('Logger');
});

test('creates a named logger', () => {
  let log = logger.createLogger('FUBAR');
  expect(log.name).toBe('FUBAR');
});

test('creates a named logger', () => {
  let log = logger.createLogger('FUBAR');
  expect(log.name).toBe('FUBAR');
});

test('creates with an init object', () => {
  let log = logger.createLogger({ level: logger.INFO, name: 'FUBAR' });
  expect(log.name).toBe('FUBAR');
});

test('allows custom logger console', () => {
  let cust = {
    log: function (msg) {
      return msg;
    }
  }

  let log = logger.createLogger({ level: logger.DEBUG, name: 'CUSTCON', console: cust });

  expect(log.log('hello')).toBe('CUSTCON: hello');
});

test('does not fail on invalid logger', () => {
  let cust = {}

  let log = logger.createLogger({ level: logger.DEBUG, name: 'CUSTCON', console: cust });

  expect(log.log('hello')).toBeUndefined;
});

test('does not fail on null logger', () => {

  let log = logger.createLogger({ level: logger.DEBUG, name: 'CUSTCON', console: null });

  expect(log.log('hello')).toBeUndefined;
});


test('filters verbose logs', () => {
  let cust = {
    log: function (msg) {
      return msg;
    }
  }

  let log = logger.createLogger({ level: logger.WARN, name: 'CUSTCON', console: cust });

  expect(log.warn('hello')).toBe('CUSTCON: hello');
  expect(log.error('hello')).toBe('CUSTCON: hello');
  expect(log.debug('hello')).toBeUndefined;
  expect(log.log('hello')).toBeUndefined;
  expect(log.info('hello')).toBeUndefined;

});

test('creates a named logger', () => {
  let log = logger.createLogger('buffer');
  expect(log.name).toBe('buffer');
  log.warn('test 1');
  log.log('test 2');

  var result = log.getBuffer();
  expect(result.length).toBe(2);
});


