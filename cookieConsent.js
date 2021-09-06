const setDefaultConsentState = require('setDefaultConsentState');

setDefaultConsentState({
  'ad_storage': 'denied',
  'analytics_storage': 'denied',
  'functionality_storage': 'denied',
  'personalization_storage': 'denied',
  'security_storage': 'denied',
  'wait_for_update': 500
});

const updateConsentState = require('updateConsentState');

const splitInput = (input) => {
  return input.split(',')
    .map(entry => entry.trim())
    .filter(entry => entry.length !== 0);
};

const parseCommandData = (settings) => {
  const regions = splitInput(settings.region);
  const granted = splitInput(settings.granted);
  const denied = splitInput(settings.denied);

  const commandData = {};
  if (regions.length > 0) {
    commandData.region = regions;
  }
  granted.forEach(entry => {
    commandData[entry] = 'granted';
  });
  denied.forEach(entry => {
    commandData[entry] = 'denied';
  });
  return commandData;
};

if (data.command === 'default') {
  data.defaultSettings.forEach(settings => {
    const commandData = parseCommandData(settings);
    setDefaultConsentState(commandData);
  });
}
if (data.command === 'update') {
  data.updateSettings.forEach(settings => {
    const commandData = parseCommandData(settings);
    updateConsentState(commandData);
  });
}

data.gtmOnSuccess();