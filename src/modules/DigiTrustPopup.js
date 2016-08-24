'use strict';

var env = require('../config/env.json').current;
var configGeneral = require('../config/general')[env];
var helpers = require('./helpers');

var fontFamily = 'Helvetica, Arial, Verdana, sans-serif';
var mq = {
    phoneString: '(min-width : 320px) and (max-width : 768px)',
    tabletString: '(min-width : 768px) and (max-width : 1024px)',
    desktopString: '(min-width : 1024px)',
};

var DigiTrustPopup = {};

var _mqPhone = function () {
    return window.matchMedia(mq.phoneString);
};

var _mqTablet = function () {
    return window.matchMedia(mq.tabletString);
};

DigiTrustPopup.createAdblockPopup = function (initializeOptions, hasApps) {

    /* Blur document text
    */
    var fontColorBody = document.body.style.color;
    fontColorBody = fontColorBody || '#000000';
    document.body.style.color = 'transparent';
    document.body.style.textShadow = '0 0 7px ' + fontColorBody;

    /* Blur individual elements
    */

    var fontColor = fontColorBody;
    var allTags = document.body.getElementsByTagName('*');
    var totalTags = allTags.length;
    for (var i = 0; i < totalTags; i++) {
        // Blur text
        fontColor = document.defaultView.getComputedStyle(allTags[i], null).color;
        if (fontColor === 'rgba(0, 0, 0, 0)') {
            fontColor = fontColorBody;
        }

        allTags[i].style.color = 'transparent';
        allTags[i].style.textShadow = '0 0 7px ' + fontColor;
        // Blur images
        allTags[i].style.filter = 'blur(1px)';
        allTags[i].style.webkitFilter = 'blur(1px)';
        allTags[i].style.mozFilter = 'blur(1px)';
        allTags[i].style.msFilter = 'progid:DXImageTransform.Microsoft.Blur(PixelRadius="5");';
        allTags[i].style.oFilter = 'blur(1px)';
    }

    /* DIVs
    */

    var appsDiv = document.createElement('div');
    appsDiv.id = configGeneral.htmlIDs.dtAdbApps;

    var reloadDiv = document.createElement('div');
    reloadDiv.id = 'digitrust-adb-reload';
    reloadDiv.innerHTML = hasApps ? 'SELECT APP & RELOAD THE PAGE' : 'TURN OFF ADBLOCK & RELOAD THE PAGE';
    if (! initializeOptions.adblocker.unstyled) {
        reloadDiv.style.cursor = 'pointer';
        reloadDiv.style.background = '#006080';
        reloadDiv.style.color = '#FFF';
        reloadDiv.style.fontSize = '15px';
        reloadDiv.style.fontWeight = '600';
        reloadDiv.style.letterSpacing = '.05em';
        reloadDiv.style.position = 'absolute';
        reloadDiv.style.textAlign = 'center';
        reloadDiv.style.borderBottom = '10px solid #279CBF';
        reloadDiv.style.padding = '30px 50px 20px';
        reloadDiv.style.bottom = '-45px';
        reloadDiv.style.right = '30px';
        reloadDiv.style.textTransform = 'uppercase';
        reloadDiv.style.width = '365px';
        if (_mqTablet().matches) {
            reloadDiv.style.width = '355px';
            reloadDiv.style.padding = '25px 0 25px';
            reloadDiv.style.bottom = '-38px';
            reloadDiv.style.right = '30px';
        } else if (_mqPhone().matches) {
            reloadDiv.style.width = '180px';
            reloadDiv.style.padding = '25px 5px 25px';
            reloadDiv.style.bottom = '-25px';
            reloadDiv.style.right = '20px';
        }
    }

    if (hasApps) {
        reloadDiv.onclick = function () {
            var selectedAppList = document.getElementsByClassName(configGeneral.htmlIDs.dtAdbAppSelected);
            var selectedApp = selectedAppList[0];
            var appId = selectedApp.getAttribute('data-appId');
            console.log(appId);
            if (appId.length > 0) {
                var app = window.DigiTrust.apps[appId];
                console.log(app);
                if (app) {
                    helpers.MinPubSub.publish('DigiTrust.pubsub.app.selected.reload', [app]);
                } else {
                    throw new Error('App Object with this ID does not exist');
                }
            } else {
                throw new Error('App ID string missing');
            }
        };
    } else {

        reloadDiv.onclick = function () {
            location.reload();
        };
    }

    var publisherLogo;
    if (initializeOptions.adblocker.logoSrc) {
        publisherLogo = document.createElement('img');
        publisherLogo.src = initializeOptions.adblocker.logoSrc;
        if (! initializeOptions.adblocker.unstyled) {
            publisherLogo.style.display = 'block';
            publisherLogo.style.maxWidth = '90%';
        }
    } else {
        publisherLogo = document.createElement('h1');
        publisherLogo.innerHTML = initializeOptions.adblocker.logoText;
        if (! initializeOptions.adblocker.unstyled) {
            publisherLogo.style.margin = '0';
        }
    }
    publisherLogo.id = 'digitrust-publisher-logo';

    var clearBothDiv = document.createElement('div');
    clearBothDiv.style.clear = 'both';

    var poweredByImg = document.createElement('img');
    poweredByImg.id = 'digitrust-powered-by-logo';
    poweredByImg.src = '//cdn.digitru.st/prod/v1/powered_by.png';
    // can_style
    if (! initializeOptions.adblocker.unstyled) {
        poweredByImg.style.width = '150px';
        if (_mqTablet().matches) {
            poweredByImg.style.width = '80px';
        } else if (_mqPhone().matches) {
            poweredByImg.style.width = '80px';
        }
    }

    var poweredByDiv = document.createElement('div');
    poweredByDiv.id = 'digitrust-powered-by-container';
    poweredByDiv.innerHTML = 'Powered By<br/>';
    // can_style
    if (! initializeOptions.adblocker.unstyled) {
        poweredByDiv.style.fontSize = '.8em';
        poweredByDiv.style.color = '#9B9B99';
        poweredByDiv.style.position = 'absolute';
        poweredByDiv.style.bottom = '20px';
        poweredByDiv.style.left = '30px';
        if (_mqTablet().matches) {
            poweredByDiv.style.position = 'static';
            poweredByDiv.style.padding = '0 0 10px';
        } else if (_mqPhone().matches) {
            poweredByDiv.style.position = 'static';
            poweredByDiv.style.padding = '10px 0 10px';
        }
    }
    poweredByDiv.appendChild(poweredByImg);

    var messageDiv = document.createElement('div');
    messageDiv.id = configGeneral.htmlIDs.dtAdbMessage;
    messageDiv.innerHTML = initializeOptions.adblocker.userMessage;
    if (! initializeOptions.adblocker.unstyled) {
        messageDiv.style.float = 'left';
        messageDiv.style.width = '250px';
        messageDiv.style.margin = '15px 0 85px';
        if (_mqTablet().matches) {
            messageDiv.style.width = '150px';
            messageDiv.style.marginBottom = '15px';
        } else if (_mqPhone().matches) {
            messageDiv.style.width = '100%';
            messageDiv.style.float = 'none';
            messageDiv.style.marginBottom = '15px';
        }
    }

    var pictureDiv;
    if (initializeOptions.adblocker.pictureSrc) {
        pictureDiv = document.createElement('img');
        pictureDiv.id = configGeneral.htmlIDs.publisherPicture;
        if (! initializeOptions.adblocker.unstyled) {
            pictureDiv.style.margin = '15px 0 20px 0';
            pictureDiv.style.float = 'right';
            pictureDiv.style.width = '465px';

            if (_mqTablet().matches) {
                pictureDiv.style.margin = '15px 0 0 0';
                pictureDiv.style.width = '420px';
                pictureDiv.style.float = 'right';
            } else if (_mqPhone().matches) {
                pictureDiv.style.margin = '0 0 0 0';
                pictureDiv.style.width = '100%';
                pictureDiv.style.float = 'none';
            }
        }
        pictureDiv.src = initializeOptions.adblocker.pictureSrc;
    } else {
        pictureDiv = document.createElement('span');
    }

    var contentDiv = document.createElement('div');
    contentDiv.id = configGeneral.htmlIDs.dtAdbContainer;
    // can_style
    if (! initializeOptions.adblocker.unstyled) {
        contentDiv.style.width = '740px';
        contentDiv.style.fontWeight = '300';
        contentDiv.style.position = 'absolute';
        contentDiv.style.padding = '50px 30px 30px 30px';
        contentDiv.style.margin = '80px 0 70px';
        contentDiv.style.left = '50%';
        contentDiv.style.transform = 'translate(-50%, 0)';
        contentDiv.style.background = initializeOptions.adblocker.popupBackgroundColor;
        contentDiv.style.color = initializeOptions.adblocker.popupFontColor;
        contentDiv.style.opacity = 1;
        contentDiv.style.fontSize = '15px';
        contentDiv.style.fontFamily = fontFamily;
        contentDiv.style.textShadow = 'none';
        contentDiv.style.border = '1px solid #D8D8D8';
        contentDiv.style.borderTopWidth = '30px';
        contentDiv.style.borderTopLeftRadius = '7px';
        contentDiv.style.borderTopRightRadius = '7px';
        contentDiv.style.borderBottomWidth = '10px';
        contentDiv.style.borderBottomLeftRadius = '7px';
        contentDiv.style.borderBottomRightRadius = '7px';
        contentDiv.style.borderBottomColor = '#2E7C97';
        contentDiv.style.boxShadow = '0px 0px 15px 5px rgba(0,0,0,0.15)';
        // Media queries
        if (_mqTablet().matches) {
            contentDiv.style.width = '570px';
            contentDiv.style.padding = '50px 30px 0 30px';
        } else if (_mqPhone().matches) {
            contentDiv.style.width = '324px';
            contentDiv.style.padding = '30px 20px 0 20px';
            contentDiv.style.fontSize = '12px';
            contentDiv.style.lineHeight = '16px';
        }
    }

    contentDiv.appendChild(publisherLogo);
    contentDiv.appendChild(messageDiv);
    contentDiv.appendChild(appsDiv);
    contentDiv.appendChild(pictureDiv);
    contentDiv.appendChild(clearBothDiv);
    contentDiv.appendChild(poweredByDiv);
    contentDiv.appendChild(reloadDiv);

    var scrollContainer = document.createElement('div');
    scrollContainer.id = 'digitrust-scroll-container';
    // can_style
    if (! initializeOptions.adblocker.unstyled) {
        scrollContainer.style.overflowY = 'scroll';
        scrollContainer.style.width = '100%';
        scrollContainer.style.height = '100%';
        scrollContainer.style.position = 'absolute';
    }
    scrollContainer.appendChild(contentDiv);

    var blurDiv = document.createElement('div');
    blurDiv.id = 'digitrust-adb-blur';
    blurDiv.style.width = '100%';
    blurDiv.style.height = '100%';
    blurDiv.style.opacity = 0.8;
    blurDiv.style.background = '#ffffff';
    blurDiv.style.position = 'fixed';

    var bgDiv = document.createElement('div');
    bgDiv.id = 'digitrust-adb-bg';
    bgDiv.style.zIndex = 999999;
    if (! initializeOptions.adblocker.unstyled) {
        bgDiv.style.width = '100%';
        bgDiv.style.height = '100%';
        bgDiv.style.top = '0';
        bgDiv.style.left = '0';
        bgDiv.style.position = 'fixed';
        bgDiv.style.overflowY = 'scroll';
    }

    bgDiv.appendChild(blurDiv);
    bgDiv.appendChild(scrollContainer);
    document.body.appendChild(bgDiv);

    // Block scroll on body
    document.body.style.overflowY = 'hidden';
};

DigiTrustPopup.createConsentPopup = function (initializeOptions) {

    var optOut = document.createElement('a');
    optOut.id = configGeneral.htmlIDs.consentLinkId;
    optOut.innerHTML = 'You can read more or opt out of DigiTrust here.';
    optOut.href = configGeneral.urls.optoutInfo;
    if (! initializeOptions.adblocker.unstyled) {
        optOut.style.padding = '0 0 0 10px';
    }
    

    var textDiv = document.createElement('div');
    textDiv.id = 'digitrust-c-text';
    textDiv.innerHTML = initializeOptions.consent.userMessage;
    if (! initializeOptions.adblocker.unstyled) {
        textDiv.style.padding = '5px 50px';
    }
    textDiv.appendChild(optOut);

    var iDiv = document.createElement('div');
    iDiv.id = 'digitrust-c-info';
    iDiv.innerHTML = 'i';
    if (! initializeOptions.adblocker.unstyled) {
        iDiv.style.padding = '5px 15px';
        iDiv.style.float = 'left';
        iDiv.style.background = '#999999';
        iDiv.style.color = '#ffffff';
        iDiv.style.fontFamily = 'serif';
        iDiv.style.fontSize = '16px';
        iDiv.style.fontStyle = 'italic';
        iDiv.style.top = '0';
        iDiv.style.left = '0';
        iDiv.style.position = 'absolute';
        iDiv.style.borderBottomRightRadius = '5px';
    }

    var bgDiv = document.createElement('div');
    bgDiv.id = 'digitrust-c-bg';
    bgDiv.style.zIndex = 999998;
    if (! initializeOptions.adblocker.unstyled) {
        bgDiv.style.width = '100%';
        bgDiv.style.bottom = '0';
        bgDiv.style.left = '0';
        bgDiv.style.position = 'fixed';
        bgDiv.style.fontFamily = fontFamily;
        bgDiv.style.fontSize = '12px';
        bgDiv.style.lineHeight = '18px';
        bgDiv.style.background = initializeOptions.consent.popupBackgroundColor;
        bgDiv.style.color = initializeOptions.consent.popupFontColor;
    }

    bgDiv.appendChild(iDiv);
    bgDiv.appendChild(textDiv);

    document.body.appendChild(bgDiv);
};

DigiTrustPopup.createAppOptionsPopup = function (initializeOptions) {

    var bgDiv = document.createElement('div');
    bgDiv.id = 'digitrust-apps-options';
    bgDiv.style.zIndex = 999998;
    if (! initializeOptions.adblocker.unstyled) {
        bgDiv.style.bottom = '0';
        bgDiv.style.left = '0';
        bgDiv.style.right = '0';
        bgDiv.style.padding = '5px';
        bgDiv.style.position = 'fixed';
        bgDiv.style.fontFamily = fontFamily;
        bgDiv.style.fontSize = '12px';
        bgDiv.style.lineHeight = '18px';
        bgDiv.style.background = initializeOptions.consent.popupBackgroundColor;
        bgDiv.style.color = initializeOptions.consent.popupFontColor;
    }

    var closeDiv = document.createElement('div');
    closeDiv.id = 'digitrust-apps-options-close';
    closeDiv.innerHTML = 'x';
    if (! initializeOptions.adblocker.unstyled) {
        closeDiv.style.cursor = 'pointer';
        closeDiv.style.position = 'absolute';
        closeDiv.style.right = '7px';
        closeDiv.style.top = '5px';
        closeDiv.style.fontWeight = 'bold';
    }
    closeDiv.onclick = function () {
        document.getElementById('digitrust-apps-options').remove();
    };
    bgDiv.appendChild(closeDiv);

    document.body.appendChild(bgDiv);
};

DigiTrustPopup.getAppsDivsHtml = function (appsObject, defaultApp, reload) {

    var picture = document.getElementById(configGeneral.htmlIDs.publisherPicture);
    if (picture) {
        picture.remove();
    }

    var appsHTML = document.createElement('div');
    appsHTML.id = 'digitrust-apps-select-container';
    if (! window.DigiTrust.initializeOptions.adblocker.unstyled) {
        appsHTML.style.height = '370px';
        appsHTML.style.width = '485px';
        appsHTML.style.float = 'right';
        appsHTML.style.margin = '10px -10px 10px 0';
        appsHTML.style.overflowY = 'scroll';
        if (_mqTablet().matches) {
            appsHTML.style.height = '340px';
            appsHTML.style.width = '373px';
            appsHTML.style.margin = '10px -10px 0 0';
        } else if (_mqPhone().matches) {
            appsHTML.style.height = '280px';
            appsHTML.style.width = '324px';
            appsHTML.style.float = 'none';
            appsHTML.style.margin = '0 0 0 5px';
        }
    }

    var _optionOnclick = function (option) {
        return function () {
            var allApps = document.getElementsByClassName('dt-app');
            for (var i = 0; i < allApps.length; i++) {
                allApps[i].style.background = '#ffffff';
                allApps[i].className = configGeneral.htmlIDs.dtAdbAppClass;
            }

            option.className += ' ' + configGeneral.htmlIDs.dtAdbAppSelected + ' '; // keep spaces
            option.style.background = '#CCDFE5 url("' + configGeneral.urls.digitrustHostPath +
                'selected_mark.png") no-repeat 170px 0';
            if (_mqTablet().matches) {
                option.style.background = '#CCDFE5 url("' + configGeneral.urls.digitrustHostPath +
                    'selected_mark.png") no-repeat 120px 0';
            } else if (_mqPhone().matches) {
                option.style.background = '#CCDFE5 url("' + configGeneral.urls.digitrustHostPath +
                    'selected_mark.png") no-repeat 90px 0';
            }

            /*var app = window.DigiTrust.apps[appId];
            if (reload === true) {
                helpers.MinPubSub.publish('DigiTrust.pubsub.app.selected.reload', [app]);
            } else {
                helpers.MinPubSub.publish('DigiTrust.pubsub.app.selected.noreload', [app]);
            }*/
        };
    };

    for (var appId in appsObject) {
        if (appsObject.hasOwnProperty(appId)) {
            var icon = document.createElement('img');
            if (appsObject[appId].icon && appsObject[appId].icon.url) {
                icon.src = appsObject[appId].icon.url;
            }
            icon.style.display = 'block';
            icon.style.margin = 'auto';
            icon.style.maxWidth = '40%';

            var appLabel = document.createElement('div');
            appLabel.innerHTML = appsObject[appId].name;
            appLabel.style.margin = '20px 0 0 0';

            var option = document.createElement('div');
            option.id = 'dt-app-id-' + appId;
            option.className = configGeneral.htmlIDs.dtAdbAppClass;
            option.setAttribute('data-appId', appId);
            if (! window.DigiTrust.initializeOptions.adblocker.unstyled) {
                option.style.fontSize = '10px';
                option.style.width = '200px';
                option.style.float = 'left';
                option.style.textAlign = 'left';
                option.style.border = '1px solid #EEE';
                option.style.margin = '10px';
                option.style.padding = '30px 10px 10px 10px';
                option.style.boxShadow = '0px 0px 5px 5px rgba(0,0,0,0.10)';
                option.style.background = '#ffffff';
                option.style.cursor = 'pointer';
                if (_mqTablet().matches) {
                    option.style.width = '150px';
                    option.style.padding = '15px 7px 7px 7px';
                } else if (_mqPhone().matches) {
                    option.style.width = '120px';
                    option.style.padding = '10px 7px 7px 7px';
                    option.style.boxShadow = '0px 0px 5px 2px rgba(0,0,0,0.10)';
                }
            }
            option.appendChild(icon);
            option.appendChild(appLabel);

            option.onclick = _optionOnclick(option);

            /*if (defaultApp && appsObject[appId].name === defaultApp.name) {
                option.setAttribute('data-selected', 'true');
            }*/

            appsHTML.appendChild(option);
        }
    }

    var statusText = document.createElement('span');
    statusText.id = 'digitrust-apps-select-status';
    appsHTML.appendChild(statusText);

    return appsHTML;
};

DigiTrustPopup.getAppsSelectHtml = function (appsObject, defaultApp, reload) {
    var appsHTML = document.createElement('div');
    appsHTML.id = 'digitrust-apps-select-container';

    var appsSelectList = document.createElement('select');
    appsSelectList.id = 'digitrust-apps-select';
    for (var appId in appsObject) {
        if (appsObject.hasOwnProperty(appId)) {
            var option = document.createElement('option');
            option.value = appId;
            option.text = appsObject[appId].name;

            if (defaultApp && appsObject[appId].name === defaultApp.name) {
                option.selected = true;
            }

            appsSelectList.appendChild(option);
        }
    }
    appsHTML.appendChild(appsSelectList);

    var setAppButton = document.createElement('button');
    setAppButton.id = 'digitrust-apps-set-app';
    setAppButton.innerHTML = 'Select';
    setAppButton.onclick = function () {
        var element = document.getElementById('digitrust-apps-select');
        var appId = element.options[element.selectedIndex].value;
        var app = window.DigiTrust.apps[appId];
        if (reload === true) {
            helpers.MinPubSub.publish('DigiTrust.pubsub.app.selected.reload', [app]);
        } else {
            helpers.MinPubSub.publish('DigiTrust.pubsub.app.selected.noreload', [app]);
        }
    };
    appsHTML.appendChild(setAppButton);

    var statusText = document.createElement('span');
    statusText.id = 'digitrust-apps-select-status';
    appsHTML.appendChild(statusText);

    return appsHTML;
};

module.exports = DigiTrustPopup;
