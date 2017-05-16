module.exports = (controller) => {

    controller.registerCall("kronoos::print", () => {

        if (controller.call("kronoos::queue")) {
            controller.alert({
                title: "Existem trabalhos sendo executados.",
                subtitle: "Aguarde a conclusão para imprimir.",
                paragraph: "Ainda não é possível imprimir os resultados."
            });
            return;
        }

        let canvas = $(".kronoos-application .vis-network canvas");
        let canvasImage;

        if (canvas.length) {
            canvasImage = canvas.get(0).toDataURL();
        }

        $(".kronoos-print-result")
            .empty()
            .append($(".kronoos-result").clone());
        if (canvasImage) {
            $(".kronoos-print-result .vis-network canvas").replaceWith($("<img />").attr({
                src: canvasImage
            }));
        }
        $(".kronoos-print-result .minimized").removeClass("minimized");
        window.print();
    });

};
