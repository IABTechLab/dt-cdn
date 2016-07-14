'use strict';

var env = require('../config/env.json').current;
var configGeneral = require('../config/general.json')[env];
var configErrors = require('../config/errors.json');
var helpers = require('./helpers');
var DigiTrustPopup = require('./DigiTrustPopup');
var DigiTrustCommunication = require('./DigiTrustCommunication');
var DigiTrustCookie = require('./DigiTrustCookie');

var DigiTrustAppContainer = {};

DigiTrustAppContainer.launch = function (options) {

    // Get Apps manifest
    helpers.xhr.get(options.apps.manifest)
    .success(function (data, xhrObj) {

        if (!helpers.isValidJSON(data)) {
            throw new Error(configErrors.en.appManifestInvalid);
        } else {
            data = JSON.parse(data);
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
                    var selectedApp;
                    var _launchAdblockPopup = function () {
                        DigiTrustPopup.createAdblockPopup(options, true);
                        var appsHTML = DigiTrustPopup.getAppsDivsHtml(window.DigiTrust.apps, null, true);
                        document.getElementById(configGeneral.htmlIDs.dtAdbApps).appendChild(appsHTML);
                    };

                    var _launchReminderPopup = function () {
                        var appsHTML = DigiTrustPopup.getAppsSelectHtml(window.DigiTrust.apps, selectedApp, false);
                        DigiTrustPopup.createAppOptionsPopup(options);
                        document.getElementById('digitrust-apps-options').appendChild(appsHTML);
                    };

                    if (!helpers.isEmpty(appFromLS)) {
                        // Is user selected app still made available by Publisher??
                        selectedApp = helpers.getObjectByKeyFromObject(
                            window.DigiTrust.apps,
                            'name',
                            appFromLS.name
                        );

                        if (selectedApp) {
                            // How frequently do we show the reminder?
                            var _ifShowReminder = function () {
                                // If reminder cookie has not expired yet, do not show
                                if (DigiTrustCookie.getCookieByName(configGeneral.app.cookie.reminderObjectKey)) {
                                    return false;
                                } else {
                                    // If reminder cookie expired, set new cookie and show reminder
                                    DigiTrustCookie.setAppReminderCookie();
                                    return true;
                                }
                            };
                            if (_ifShowReminder()) {
                                _launchReminderPopup(options);
                            }
                            DigiTrustAppContainer.insertAppScript(selectedApp, false);
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
        }
    })
    .error(function (data, xhrObj) {
        throw new Error(configErrors.en.appManifestXHR);
    });
};

var _appOnLoad = function (app, publishEnable) {
    console.log(app.name, 'done loading APP JavaScript');

    if (publishEnable === true) {
        helpers.MinPubSub.publish('DigiTrust.pubsub.app.event.enable', [app.name]);
    } else {
        var publishAfterReload = localStorage.getItem('a:' + app.name + ':publishEnable');
        if (publishAfterReload === 'true') {
            helpers.MinPubSub.publish('DigiTrust.pubsub.app.event.enable', [app.name]);
            localStorage.removeItem('a:' + app.name + ':publishEnable');
        }
    }

    // If this is the first app being loaded
    if (helpers.isEmpty(window.DigiTrust.currentApp)) {
        // Might be useful for pushState page-view tracking
        // helpers.createPageViewClickListener();
    } else {
        // Disable previous app
        helpers.MinPubSub.publish('DigiTrust.pubsub.app.event.disable', [window.DigiTrust.currentApp.name]);
    }
    window.DigiTrust.currentApp = app;
    window.DigiTrust.loadedApps.push(app.name);
    helpers.MinPubSub.publish('DigiTrust.pubsub.app.event.pageView', [app.name]);
};

DigiTrustAppContainer.insertAppScript = function (app, publishEnable) {
    publishEnable = publishEnable || false;
    var r = false;
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = app.behavior;
    s.onload = s.onreadystatechange = function () {
        if (!r && (!this.readyState || this.readyState === 'complete')) {
            r = true;
            _appOnLoad(app, publishEnable);
        }
    };
    var t = document.getElementsByTagName('script')[0];
    t.parentNode.insertBefore(s, t);
};

DigiTrustAppContainer.userAppSelected = function (app, reload) {
    reload = reload || false;
    // If user selects already-loaded app, do not do anything
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

        // If we do not want to reload the page, and the app has not been loaded yet
        if (reload === false && window.DigiTrust.loadedApps.indexOf(app.name) === -1) {
            // Load App script
            DigiTrustAppContainer.insertAppScript(app, true);
        } else {
            // Launch "enable" event upon reload
            // (we reload since the AdBlocker detector popup uglifies the page's whole CSS)
            localStorage.setItem('a:' + app.name + ':publishEnable', 'true');
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
