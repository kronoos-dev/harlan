module.exports = function (controller) {

    if (controller.confs.antecedentes.hosts.indexOf(window.location.host.split(":")[0]) === -1)
        return;
    
    $.ajax({
        dataType: "JSONP",
        url: "js/proshield.js"
    });
}; 