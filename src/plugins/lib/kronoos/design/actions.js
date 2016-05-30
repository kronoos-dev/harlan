module.exports = (controller) => {

    var action = (selector, action) => {
        $(selector).click((e) => {
            e.preventDefault();
            controller.call(action);
        });
    };

    action(".kronoos-action-print", "kronoos::print");
    action(".kronoos-action-change-password", "password::change");
    action(".kronoos-action-logout", "authentication::logout");
};
