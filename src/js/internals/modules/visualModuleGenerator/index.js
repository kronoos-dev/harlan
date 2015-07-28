/* global module */

module.exports = function (controller) {
    
    var ID = "visualGenerator";
    
    var draw = function (html, ready) {
        controller.interface.addCSSDocument("css/visualGenerator.min.css");
        var jDoc = $(html).attr({id : ID});
        $("body").append(jDoc);
        componentHandler.upgradeElement(jDoc.find(".mdl-button").get(0), "MaterialButton");
        ready();
    };
    
    controller.registerTrigger("findDatabase::instantSearch", function (args, callback) {
        callback();
        args[1].item("Criar Relatório", "Desenvolva seus próprios relatórios", "Use nossa interface para criar um relatório modelo.", null, null, true)
                .addClass("saved")
                .click(function (e) {
                    e.preventDefault();
                    controller.call("vsGenerator::draw");
                });
    });
    
    controller.registerCall("vsGenerator::draw", function () {
        
        var selector = "#" + ID;
        
        var ready = function () {
            controller.interface.helpers.activeWindow(selector);
        };
        
        if ($(selector).length) {
            ready();
            return false;
        }
        
        harlan.interface.helpers.template.render("visualGenerator", {}, function (template) {
            draw($(template), ready);
        });
        
        return true;
    });
};
