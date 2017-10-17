/*jshint -W054 */
require("pseudo-worker/polyfill");

(function(path, size, compressedSize, encode) {

    'use strict';

    var
        contentIndex = 0,
        content = new Buffer(size),
        streamHttp = require("stream-http"),
        domReady = require("domready"),
        inflateWorker = new Worker("js/app-inflate.js"),
        downloadedSize = 0,
        totalSize = compressedSize + size,
        decompressedSize = 0,
        updateInterfaceProgress = function() {
            console.log(Math.floor(((downloadedSize + decompressedSize) / totalSize) * 100).toString() + "% Downloaded");
        };

    domReady(function() {
        var installScreen = document.getElementById("install-screen"),
            interfaceProgress = document.getElementById("loader-progress"),
            interfaceLogo = document.getElementById("loader-logo");

        installScreen.className = installScreen.className.replace(/(\s|^)hide(\s|$)/g, '');

        updateInterfaceProgress = function() {
            interfaceProgress.style.width = (((downloadedSize + decompressedSize) / totalSize) * 100).toString() + "%";
        };
    });

    inflateWorker.onmessage = function(message) {
        if (message.data === null) {
            (new Function(content.toString(encode)))();
            inflateWorker.terminate(); /* goodbye! */
            return;
        }

        decompressedSize += message.data.length;
        for (var i = 0; i < message.data.length; i++) {
            content[contentIndex++] = message.data[i];
        }

        updateInterfaceProgress();
    };

    streamHttp.get(path, function(pipe) {
        pipe.on('data', function(data) {
            downloadedSize += data.length;
            inflateWorker.postMessage([data, downloadedSize < compressedSize ? false : true]);
            updateInterfaceProgress();
        });
    });

})("/js/app.js.gz?h=/* @echo MD5 */", parseInt('/* @echo APP_SIZE */'), parseInt('/* @echo COMPRESSED_SIZE */'), "utf-8");
