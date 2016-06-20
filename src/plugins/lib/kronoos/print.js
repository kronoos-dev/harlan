module.exports = (controller) => {

    controller.registerCall("kronoos::print", () => {
        $(".kronoos-print-result")
            .empty()
            .append($(".kronoos-result").clone());
        window.print();
    });

};
