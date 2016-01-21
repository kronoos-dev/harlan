/* global Buffer */

(function (path, size, compressedSize, encode) {
    'use strict';
    var
            contentIndex = 0,
            content = new Buffer(size),
            streamHttp = require("stream-http"),
            domReady = require("domready"),
            assert = require("assert"),
            inflateWorker = new Worker("js/app-inflate.js"),
            downloadedSize = 0,
            totalSize = compressedSize + size,
            decompressedSize = 0,
            chunks = [],
            updateInterfaceProgress = function () {
                console.log(Math.floor(((downloadedSize + decompressedSize) / totalSize) * 100).toString() + "% Downloaded");
            };

    domReady(function () {
        var interfaceProgress = document.getElementById("loader-progress"),
                interfaceLogo = document.getElementById("loader-logo");

        updateInterfaceProgress = function () {
            var progress = (downloadedSize + decompressedSize) / totalSize;
            if (progress > 80) {
                interfaceLogo.className = "fa-spin";
            }
            interfaceProgress.style.width = (progress * 100).toString() + "%";
        };
    });

    inflateWorker.onmessage = function (message) {
        if (message.data === null) {
            assert.equal(decompressedSize, size);
            inflateWorker.terminate(); /* goodbye! */
            return;
        }

        decompressedSize += message.data.length;
        for (var i = 0; i < message.data.length; i++) {
            content[contentIndex++] = message.data[i];
        }

        updateInterfaceProgress();

        if (decompressedSize === size) {
            (new Function(content.toString(encode)))();
            return;
        }
    };

    streamHttp.get(path, function (pipe) {
        pipe.on('data', function (data) {
            downloadedSize += data.length;
            inflateWorker.postMessage([data, downloadedSize < compressedSize ? false : true]);
            updateInterfaceProgress();
        });

        pipe.on('end', function () {

            assert.equal(downloadedSize, compressedSize);
        });
    });

})("js/app.js.gz", parseInt('/* @echo APP_SIZE */'), parseInt('/* @echo COMPRESSED_SIZE */'), "utf-8");