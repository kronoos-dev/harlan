var Web3 = require("web3");

module.exports = function (controller) {

    /* default web3 instance */
    controller.web3 = window.web3 = new Web3();
    
    controller.registerBootstrap("web3::provider", function (callback) {
        /* configure default endpoint */
        web3.setProvider(new web3.providers.HttpProvider(controller.confs.web3.endpoint));
        callback();
    });
    
    /* if you want a different web3 provider */
    controller.registerCall("web3::new", function () {
        return new Web3();
    });
    
};