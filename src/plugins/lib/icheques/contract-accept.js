/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
module.exports = function (controller) {

    controller.registerTrigger("serverCommunication::websocket::authentication", "icheques::reference::websocket::authentication", function (data, callback) {
        callback();

        if (controller.serverCommunication.freeKey() || data.contractAccepted) {
            return;
        }

        controller.call("confirm", {
            title: "Você aceita com os termos de uso?",
            subtitle: "Para continuar é necessário que você aceite os termos de uso desta ferramenta.",
            paragraph: "Os termos de uso estão disponíveis <a href='/legal/icheques/MINUTA___CONTRATO__VAREJISTA___revisão_1_jcb.pdf' title='Termos de Uso'>neste link</a>, após a leitura clique em confirmar para acessar sua conta. O aceite é fundamental para que possamos disponibilizar todos os nossos serviços e você assim desfrutar de todos os benefícios iCheques.",
            confirmText: "Aceitar"
        }, function () {
            controller.serverCommunication.call("SELECT FROM 'iCheques'.'contractAccepted'");
            controller.call("alert", {icon: "pass", title: "O contrato foi aceito com sucesso", subtitle: "Agora você já pode usufruir de todas as funcionalidades do iCheques.", paragraph: "Adicionamos R$ 7,50 (sete reais e cinquenta centavos) a sua conta para que você possa experimentar nosso produto."});
        }, function () {
            controller.call("authentication::logout");
        });

    });
};