module.exports = controller => {

    if (!harlan.query.operationScore) {
        return;
    }

    controller.confirm({
        icon: "pass",
        title: "Sua avaliação foi registrada com sucesso.",
        subtitle: "Uma avaliação positiva faz com que mais usuários procurem os serviços da antecipadora.",
        paragraph: "A qualquer momento você pode mudar sua avaliação através dos links no e-mail.",
        confirmText: "Adicionar Comentário"
    }, () => {
        let modal = controller.call("modal");
        modal.gamification("lives");
        modal.title("Avaliação da Operação");
        modal.subtitle("A avaliação da operação garante a nota de nossos parceiros antecipadores.");
        modal.paragraph("Ao avaliar verifique se você está fazendo um bom juízo de suas palavras, avaliações incompletas podem ser descartadas.");

        let form = modal.createForm(),
            inputPerformance = form.addInput("quality", "number", "Nota da Operação", {}, "Nota de 0 até 10 da operação", 10).attr({
                min: 0,
                max: 10
            }),
            inputComments = form.addTextarea("comment", "Comentários");


        form.addSubmit("enviar", "Enviar");
        form.element().submit(e => {
            e.preventDefault();
            modal.close();
            controller.server.call("UPDATE 'ICHEQUES'.'Antecipate'", controller.call("loader::ajax", {
                dataType: "json",
                data: {
                    avoidredirect: true,
                    id: harlan.query.operationScore,
                    performance: inputPerformance.val(),
                    comments: inputComments.val()
                },
                success: () => {
                    toastr.success("Os dados foram registrados com sucesso.", "Sua avaliação foi publicada, lembramos que você pode alterar a mesma a qualquer instante através dos links no email.");
                }
            }, true));
        });
        modal.createActions().cancel();
    });

};
