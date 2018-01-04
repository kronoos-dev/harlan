module.exports = controller => {

    var link = null;

    controller.registerBootstrap('download', function(callback) {
        callback();
        link = document.createElement('a');
        document.body.appendChild(link);
        $(link).css('display', 'none');
    });

    controller.registerCall('download', (blob, filename = 'harlan.dat') => {
        if (!link) {
            console.error(`Could not capture link element for ${filename}`);
            return;
        }

        var url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = filename;
        link.click();
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
        }, 10000);
    });
};
