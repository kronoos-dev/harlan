(function(controller) {

    /* Configurações do Aplicativo */
    controller.confs.accuracy = {
        webserver: "http://app.accuracyapp.4vconnect.com.br/api/v2/", /* local da API */
        geofenceLimit: 150 /* metros*/
    };

    require("./lib/accuracy/design")(controller);
    require("./lib/accuracy/campaign")(controller);
    require("./lib/accuracy/checkin")(controller);
    require("./lib/accuracy/database")(controller);
    require("./lib/accuracy/login")(controller);
    require("./lib/accuracy/server")(controller);
    require("./lib/accuracy/sync")(controller);

})(harlan);
