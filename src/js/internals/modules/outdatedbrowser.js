module.exports = function (controller) {

    controller.registerBootstrap("outdatedbrowser", callback => {
        callback();
        outdatedBrowser({
            bgColor: '#f25648',
            color: '#ffffff',
            lowerThan: 'transform',
            languagePath: '/outdatedbrowser/lang/pt.html'
        });
    });

};
