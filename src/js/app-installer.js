/*jshint -W054 */
import 'pseudo-worker/polyfill';

((path, size, compressedSize, encode) => {
    let contentIndex = 0;
    const content = new Buffer(size);
    const streamHttp = require('stream-http');
    const domReady = require('domready');
    const inflateWorker = new Worker('js/app-inflate.js');
    let downloadedSize = 0;
    const totalSize = compressedSize + size;
    let decompressedSize = 0;

    let updateInterfaceProgress = () => {
    };

    domReady(() => {
        const installScreen = document.getElementById('install-screen');
        const interfaceProgress = document.getElementById('loader-progress');
        const interfaceLogo = document.getElementById('loader-logo');

        installScreen.className = installScreen.className.replace(/(\s|^)hide(\s|$)/g, '');

        updateInterfaceProgress = () => {
            interfaceProgress.style.width = `${(((downloadedSize + decompressedSize) / totalSize) * 100).toString()}%`;
        };
    });

    inflateWorker.onmessage = ({data}) => {
        if (data === null) {
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
})('/js/app.js.gz?h=/* @echo MD5 */', parseInt('/* @echo APP_SIZE */'), parseInt('/* @echo COMPRESSED_SIZE */'), 'utf-8');
