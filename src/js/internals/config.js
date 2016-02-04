var url = require("url");

module.exports = {
    proshield: {
        hosts: [
            "proshield",
            "proshield.com.br",
            "www.proshield.com.br",
            "proshield.harlan.com.br"
        ]
    },
    icheques: {
        hosts: [
            "icheques.com.br",
            "www.icheques.com.br"
        ]
    },
    instantSearchDelay: 500, /* ms */
    animatedShowTable: 300,
    hideAutocomplete: 300,
    zeroClipboard: {
        swfPath: "/assets/ZeroClipboard.swf"
    },
    iugu: {
        debug: false,
        token: "44176a3c-50ec-4c45-b092-1d957813d22d"
    },
    oauthKey: "AYY0iBNDo95aIcw--iWIqa71ZJs",
    checkoutUrl: 'https://irql.bipbop.com.br/api/checkout.html',
    inboxTime: 50000,
    googleAnalyticsId: "UA-36688252-3", /* Universal Analytics */
    web3: {
        endpoint: "http://localhost:8545"
    },
    roost: {
        apiKey : ""
    }
};
