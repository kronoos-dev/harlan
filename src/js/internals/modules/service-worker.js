/* global module */

"use strict";

module.exports = function (controller) {

    controller.registerBootstrap("manifest", function (callback) {
        callback();
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js', {scope: './'}).then(function () {
                console.log("Whatever");
            }).catch(function (err) {
                // registration failed :(
                console.log('ServiceWorker registration failed: ', err);
            });
        }
    });

};