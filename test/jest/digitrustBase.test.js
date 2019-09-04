
const DigiTrust = require('../../src/modules/DigiTrust');
const helpers = require('../../src/modules/helpers');

window.DigiTrust = DigiTrust;

var originVal = "https://cdn.digitru.st";
var newVal = "https://foo.site.com";
var oldData = {
  iframe: { postMessageOrigin: originVal }
};
var newData = {
  iframe: { postMessageOrigin: newVal }
};


beforeEach(() => {
  DigiTrust._config.reload();
  DigiTrust._config.getConfig().loadConfig(oldData);
})


test('DigiTrust config loaded', () => {
  var originVal = "https://cdn.digitru.st";
  var key = 'iframe.postMessageOrigin'
  expect(DigiTrust._config.getConfig().getValue(key)).toBe(originVal);
});


test('DigiTrust config sets value', () => {
  var originVal = "https://cdn.digitru.st";
  var newVal = "https://foo.site.com";
  var key = 'iframe.postMessageOrigin'
  expect(DigiTrust._config.getConfig().getValue(key)).toBe(originVal);


  DigiTrust._config.getConfig().loadConfig(newData);

  expect(DigiTrust._config.getConfig().getValue(key)).toBe(newVal);
});


test('helpers has same config sets value', () => {
  var key = 'iframe.postMessageOrigin'
  expect(DigiTrust._config.getConfig().getValue(key)).toBe(originVal);

  DigiTrust._config.getConfig().loadConfig(newData);

  expect(helpers.getConfig().getValue(key)).toBe(newVal);
});

