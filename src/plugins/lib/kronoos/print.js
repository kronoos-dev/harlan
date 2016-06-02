module.exports = (controller) => {

    controller.registerCall("kronoos::print", () => {
        controller.interface.helpers.activeWindow(".kronoos-print");
    });

};
