/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

module.exports = function (controller) {


    controller.registerTrigger("serverCommunication::websocket::authentication", "kronoos::contract::websocket::authentication", function (data, callback) {
        callback();

        if (controller.serverCommunication.freeKey() || data.contractAccepted) {
            return;
        }

        controller.call("confirm", {
            title: "Você aceita com o contrato de serviço?",
            subtitle: "Para continuar é necessário que você aceite o contrato de serviço desta ferramenta.",
            paragraph: `O contrato de serviço estão disponíveis <a target='_blank' href='legal/kronoos/MINUTA___CONTRATO___CONTA.pdf' title='contrato de serviço'>neste link</a>, após a leitura clique em confirmar para acessar sua conta. O aceite é fundamental para que possamos disponibilizar todos os nossos serviços e você assim desfrutar do Kronoos.`,
            confirmText: "Aceitar"
        }, function () {
            controller.serverCommunication.call("SELECT FROM 'KRONOOSUSER'.'CONTRACTACCEPTED'");
            controller.call("alert", {icon: "pass", title: "O contrato foi aceito com sucesso", subtitle: "Agora você já pode usufruir de todas as funcionalidades do Kronoos.", paragraph: "Agora você já pode começar a utilizar o sistema e todas suas funcionalidades contradas, comece agora buscando na barra superior por um CPF ou CNPJ."});
        }, function () {
            controller.call("authentication::logout");
        });

    });
};
