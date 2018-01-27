import 'pseudo-worker/polyfill';

import ClientLoader from './internals/library/client-loader';

((path, size, compressedSize, encode) => {
    let clientLoader = null;
    let contentIndex = 0;
    const content = new Buffer(size);
    const streamHttp = require('stream-http');
    const domReady = require('domready');
    const inflateWorker = new Worker('js/app-client-inflate.js');
    let downloadedSize = 0;
    const totalSize = compressedSize + size;
    let decompressedSize = 0;

    let updateInterfaceProgress = () => {
    };

    domReady(() => {
        let harlanClient = $('<div />').class('harlan-client').prependTo('body');
        clientLoader = new ClientLoader(harlanClient);
        updateInterfaceProgress = () => {
            const progress = (downloadedSize + decompressedSize) / totalSize;
            clientLoader.parse(progress);
        };
    });

    inflateWorker.onmessage = ({data}) => {
        if (data === null) {
            if (clientLoader) clientLoader.close();
            (new Function(content.toString(encode)))();
            inflateWorker.terminate(); /* goodbye! */
            return;
        }

        decompressedSize += data.length;
        for (let i = 0; i < data.length; i++) {
            content[contentIndex++] = data[i];
        }

        updateInterfaceProgress();
    };

    streamHttp.get(path, pipe => {
        pipe.on('data', data => {
            downloadedSize += data.length;
            inflateWorker.postMessage([data, downloadedSize < compressedSize ? false : true]);
            updateInterfaceProgress();
        });
    });
})('js/app-client.js.gz?h=/* @echo CLIENT_MD5 */', parseInt('/* @echo CLIENT_APP_SIZE */'), parseInt('/* @echo CLIENT_COMPRESSED_SIZE */'), 'utf-8');
