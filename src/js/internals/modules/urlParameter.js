module.exports = function (controller) {
    
    var hasUrlParameter = false;
    
    controller.registerBootstrap("urlParameter", function () {
        
        if (typeof controller.query.q === "undefined") {
            return;
        }
        
        $("#input-q").val(controller.query.q.replace(/\/$/, ""));
        $("#main-search").submit();
    });
    
};