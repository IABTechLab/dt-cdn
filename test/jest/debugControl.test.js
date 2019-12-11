const digitrustRoot = require('../../src/modules/DigiTrust');
const debugCtrl = require('../../src/modules/DebugControl');
const helpers = require('../../src/modules/helpers');

beforeAll(() => {
  if (!window.DigiTrust) {
    window.DigiTrust = { isClient: true, version: '1.0.mock' };
  }
});

test('can create debugControl', () => {
  let mockDt = {
    util: helpers
  };
  let target = debugCtrl.createDebugControl(mockDt);
  expect(target).not.toBeNull;
  expect(target.isDebug()).toBeFalsy;
});


test('can toggle mock state', () => {
  let mockDt = {
    util: helpers
  };
  let target = debugCtrl.createDebugControl(mockDt);
  expect(target.isDebug()).toBe(false);
  target.setDebug(true);
  expect(target.isDebug()).toBe(true);
  target.setDebug(false);
  expect(target.isDebug()).toBe(false);
});


test('can toggle real obj state', () => {
  let target = debugCtrl.createDebugControl(digitrustRoot);
  expect(target.isDebug()).toBe(false);
  target.setDebug(true);
  expect(target.isDebug()).toBe(true);
  target.setDebug(false);
  expect(target.isDebug()).toBe(false);
});

test('can dump log output', () => {
  let target = debugCtrl.createDebugControl(digitrustRoot);
  var log = target.dumpLogs();
  expect(log.length).toBeGreaterThan(1);

});
