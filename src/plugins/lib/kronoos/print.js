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

        controller.call("kronoos::parsers").map(parser => parser.downloadPDF());
    });

};
