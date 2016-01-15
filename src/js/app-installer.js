var AppInstaller = function (jsPath, refreshRate, downloadStopAt) {

    var xhr = new XMLHttpRequest(),
            domReady = require("domready"),
            interval = null,
            interfaceProgress;

    var drawInterface = function (bootProgress) {
        bootProgress = bootProgress || 0;

        var totalBytes = parseInt(xhr.getResponseHeader('Content-length')),
                dlBytes = xhr.responseText.length,
                downloadProgress = (dlBytes / totalBytes) * 100;

        var partialDownloadProgress = (downloadStopAt * downloadProgress / 100);
        var partialBootProgress = (((downloadStopAt - 100) * bootProgress) / 100);
        var totalProgress = partialBootProgress + partialDownloadProgress;

        interfaceProgress.style.width = totalProgress.toString() + "%";
    };

    var clear = function () {
        clearInterval(interval);
        interval = null;
    };


    xhr.addEventListener("loadend", clear);

    xhr.addEventListener("load", function () {
        (new Function(xhr.responseText))();
    });

    xhr.onreadystatechange = function () {
        switch (xhr.readyState) {
            case 2:
                interval = setInterval(drawInterface, refreshRate);
                break;
        }
    };

    var loadHarlan = function () {
        interfaceProgress = document.getElementById("loader-progress");
        interfaceProgress = document.getElementById("loader-progress");
        xhr.open("GET", jsPath);
        xhr.overrideMimeType("application/javascript");
        xhr.send();
    };

    domReady(loadHarlan);

    return this;
};

new AppInstaller("js/app.js", 90, 100);