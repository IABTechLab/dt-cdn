'use strict';

var popup = {};

popup.createAdblockPopup = function (options) {

    var div = document.createElement('div');
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.top = '0';
    div.style.left = '0';
    div.style.position = 'absolute';
    div.style.background = options.adblocker.popupBackgroundColor;
    div.style.color = options.adblocker.popupFontColor;
    div.innerHTML = options.adblocker.userMessage;

    document.body.appendChild(div);
};

module.exports = popup;
