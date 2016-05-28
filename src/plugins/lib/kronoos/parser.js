var _ = require("underscore"),
    sprintf = require("sprintf");

var namespaceDescription = {
    "peps": ["Pessoa Políticamente Exposta", "Art. 52 da Convenção das Nações Unidas contra a Corrupção"],
    "congressmen": ["Deputado Federal", "Representante eleito para a Câmara dos Deputados"],
    "state_representatives": ["Deputado Estadual", "Representante eleito para a Assembleia Legislativa Estadual"],
    "corruption_scandals": ["Escândalo de Corrupção", "Fatos políticos marcantes chamados de escândalos"],
    "slave_work": ["Trabalho Escravo", "Lista de Trabalho Escravo"],
    "green_peace": ["Apontamento Greenpeace", "Organização não governamental de preservação do meio ambiente"],
    "ibama": ["Apontamento Ibama", "Instituto Brasileiro do Meio Ambiente e dos Recursos Naturais Renováveis"],
    "gas_station": ["Postos de Gasolina Cassados", "Estão sujeitos à fiscalização postos de combustíveis, distribuidoras e transportadoras"],
    "interpol": ["Interpol", "A Organização Internacional de Polícia Criminal"],
    "ceaf": ["Cadastro de Expulsões da Administração Federal", "Banco de informações mantido pela Controladoria-Geral da União"],
    "ceispj": ["Pessoa Jurídica listada no Cadastro listada no Cadastro Nacional de Empresas Inidôneas e Suspensas", "Banco de informações mantido pela Controladoria-Geral da União"],
    "ceispf": ["Pessoas Físicas listadas no Cadastro listada no Cadastro Nacional de Empresas Inidôneas e Suspensas", "Banco de informações mantido pela Controladoria-Geral da União"]
};

module.exports = function(controller) {

    var parserConsultas = function(document) {
        var result = controller.call("result"),
            usedNamespace = [],
            addItem = (name, text, mask) => {
                if (text)
                    result.addItem(name, mask || text);
            };

        var hasItem = false;
        $("BPQL > body > item", document).each((idx, item) => {
            hasItem = true;
            var namespace = $("namespace", item).text(),
                [title, subtitle] = namespaceDescription[namespace];

            usedNamespace.push(namespace);

            result.addSeparator(title,
                subtitle, "Existência de apontamentos cadastrais.").addClass(namespace).addClass("kronoos-contained");

            addItem("Observação", $("name_observation", item).text());

            $("notes node", item).each((idx, node) => {
                addItem("Nota", $(node).text());
            });

            addItem("Marcação", $("position", item).text());

            $("source node", item).each((idx, node) => {
                addItem("Fonte", $(node).text(),
                    sprintf("<a href=\"%s\" target=\"_blank\" title=\"Referência\">%s</a>",
                        $(node).text(), $(node).text()));
            });
        });

        result.addSeparator("Nada conta",
            subtitle, "Não constam apontamentos cadastrais.").addClass(namespace).addClass("kronoos-nothing-contained");

        // _.each(_.difference(_.keys(namespaceDescription), usedNamespace), (namespace) => {
        //     let [title, subtitle] = namespaceDescription[namespace];
        //     result.addSeparator(title,
        //         subtitle, "Não constam apontamentos cadastrais.").addClass(namespace).addClass("kronoos-nothing-contained");
        // });

        return result.element();
    };

    controller.importXMLDocument.register('KRONOOSUSER', 'API', parserConsultas);

};
