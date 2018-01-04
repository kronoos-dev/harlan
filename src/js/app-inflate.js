(function () {
    var pako = require('pako'),
        inflate = new pako.Inflate();

    inflate.onData = function (chunk) {
        postMessage(chunk);
    };

    inflate.onEnd = function () {
        postMessage(null);
    };

    onmessage = function (message) {
        inflate.push(message.data[0], message.data[1]);
    };
})();