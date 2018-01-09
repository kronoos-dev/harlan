(() => {
    const pako = require('pako');
    const inflate = new pako.Inflate();

    inflate.onData = chunk => {
        postMessage(chunk);
    };

    inflate.onEnd = () => {
        postMessage(null);
    };

    onmessage = ({data}) => {
        inflate.push(data[0], data[1]);
    };
})();
