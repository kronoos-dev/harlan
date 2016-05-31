module.exports = (controller) => {

    var action = (selector, action) => {
        $(selector).click((e) => {
            e.preventDefault();
            controller.call(action);
        });
    };

    controller.interface.helpers.menu.add("Kronoos", "undo").nodeLink.click((e) => {
        e.preventDefault();
        controller.interface.helpers.activeWindow(".kronoos-application");
    });

    $(".kronoos-action-harlan").click((e) => {
        e.preventDefault();
        controller.interface.helpers.activeWindow(".app");
    });

    $(".kronoos-action-clear").click((e) => {
        e.preventDefault();
        $(".kronoos-q").val("");
        controller.call("kronoos::clearAll");
    });

    action(".kronoos-action-print", "kronoos::print");
    action(".kronoos-action-change-password", "password::change");
    action(".kronoos-action-logout", "authentication::logout");
};
