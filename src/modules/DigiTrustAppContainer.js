'use strict';

var env = require('../config/env.json').current;
var configGeneral = require('../config/general.json')[env];
var configErrors = require('../config/errors.json');
var helpers = require('./helpers');
var DigiTrustPopup = require('./DigiTrustPopup');
var DigiTrustCommunication = require('./DigiTrustCommunication');

var DigiTrustAppContainer = {};

DigiTrustAppContainer.launch = function (options) {

    // Get Apps manifest
    helpers.xhr.get(options.apps.manifest)
    .success(function (data, xhrObj) {

        // If there are apps available
        if (!helpers.isEmpty(data.apps)) {
            for (var i = 0; i < data.apps.length; i++) {
                window.DigiTrust.apps['app' + i] = data.apps[i];
            }

            // Listen for User input
            helpers.MinPubSub.subscribe('DigiTrust.pubsub.app.selected.reload', function (app) {
                DigiTrustAppContainer.userAppSelected(app, true);
            });
            helpers.MinPubSub.subscribe('DigiTrust.pubsub.app.selected.noreload', function (app) {
                DigiTrustAppContainer.userAppSelected(app, false);
            });

            // Listen to iFrame response
            helpers.MinPubSub.subscribe('DigiTrust.pubsub.app.getAppsPreferences.response', function (appFromLS) {
                var _launchAdblockPopup = function () {
                    DigiTrustPopup.createAdblockPopup(options);
                    var appsHTML = DigiTrustPopup.getAppsSelectHtml(window.DigiTrust.apps, null, true);
                    document.getElementById('digitrust-adb-apps').appendChild(appsHTML);
                };

                var _launchReminderPopup = function () {
                    var appsHTML = DigiTrustPopup.getAppsSelectHtml(window.DigiTrust.apps, selectedApp, false);
                    DigiTrustPopup.createAppOptionsPopup(options);
                    document.getElementById('digitrust-apps-options').appendChild(appsHTML);
                };

                if (!helpers.isEmpty(appFromLS)) {
                    // Is user selected app still made available by Publisher??
                    var selectedApp = helpers.getObjectByKeyFromObject(window.DigiTrust.apps, 'name', appFromLS.name);
                    if (selectedApp) {
                        _launchReminderPopup(options);
                        DigiTrustAppContainer.insertAppScript(selectedApp);
                    } else {
                        _launchAdblockPopup(options);
                    }
                } else {
                    _launchAdblockPopup(options);
                }
            });

            // Get apps preferences from DT domain
            DigiTrustCommunication.getAppsPreferences({
                member: window.DigiTrust.initializeOptions.member
            });
        }
    })
    .error(function (data, xhrObj) {
        console.log(configErrors.appManifestXHR);
    });
};

var _appOnLoad = function (app) {
    // If this is the first app being loaded
    if (helpers.isEmpty(window.DigiTrust.currentApp)) {
        helpers.createPageViewClickListener();    
    } else {
        // Disable previous app
        helpers.MinPubSub.publish('DigiTrust.pubsub.app.event.disable', [window.DigiTrust.currentApp.name]);
    }
    window.DigiTrust.currentApp = app;
    window.DigiTrust.loadedApps.push(app.name);
    helpers.MinPubSub.publish('DigiTrust.pubsub.app.event.enable', [app.name]);
};

DigiTrustAppContainer.insertAppScript = function (app) {
    var s, r, t;
    r = false;
    s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = app.behavior;
    s.onload = s.onreadystatechange = function() {
        if ( !r && (!this.readyState || this.readyState == 'complete') ) {
            r = true;
            _appOnLoad(app);
            console.log(app.name, 'done loading script');
        }
    };
    t = document.getElementsByTagName('script')[0];
    t.parentNode.insertBefore(s, t);
};

DigiTrustAppContainer.userAppSelected = function (app, reload) {
    if (window.DigiTrust.currentApp.name === app.name) {
        document.getElementById('digitrust-apps-options-close').click();
    } else {

        helpers.MinPubSub.subscribe('DigiTrust.pubsub.app.setAppsPreferences.response', function (iframeData) {
            if (app.name === iframeData.app.name) {
                if (iframeData.success === true) {
                    if (reload === true) {
                        location.reload();
                    } else {
                        document.getElementById('digitrust-apps-options-close').click();
                    }
                } else {
                    document.getElementById('digitrust-apps-select-status')
                        .innerHTML = 'Saving failed, please try again or reload page.';
                }
            }
        });

        if (window.DigiTrust.loadedApps.indexOf(app.name) == -1) {
            // Load App script
            DigiTrustAppContainer.insertAppScript(app);
        } else {
            _appOnLoad(app);
        }

        // Update UI
        document.getElementById('digitrust-apps-select-status').innerHTML = 'Saving..';

        // Set App preference on DT domain
        DigiTrustCommunication.setAppsPreferences({
            member: window.DigiTrust.initializeOptions.member,
            app: app
        });
    }
};

/*
 * For digitru.st only
 */
DigiTrustAppContainer.server = {};

DigiTrustAppContainer.server.setAppForMember = function (member, app) {
    if (member && member.length > 0 && app.name && app.name.length > 0) {
        var appForLS = {
            name: app.name
        };
        localStorage.setItem('m:' + member, JSON.stringify(appForLS));
        return true;
    } else {
        console.log('Error DigiTrustAppContainer.server.setAppForMember: validation failed');
        return false;
    }
};

DigiTrustAppContainer.server.getAppForMember = function (member) {
    var value = localStorage.getItem('m:' + member);
    if (value) {
        return JSON.parse(value);
    }
    return {};
};

module.exports = DigiTrustAppContainer;
