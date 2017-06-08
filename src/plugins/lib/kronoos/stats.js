import {CPF, CNPJ} from 'cpf_cnpj';

export class KronoosStats {

    constructor() {
        this.elements = {};
        this.global = $("<div />").addClass("kronoos-resume");
        this.container = $("<div />").addClass("container");
        this.content = $("<div />").addClass("content");
        this.list = $("<ul />");
        this.global.append(this.container.append(this.content.append(this.list)));
    }

    create(name, document) {
        let container = $("<li />");
        let formattedDocument, documentType;

        if (CPF.isValid(document)) {
            formattedDocument = CPF.format(document);
            documentType = 'CPF';
        } else {
            formattedDocument = CNPJ.format(document);
            documentType = 'CNPJ';
        }

        container.append($("<h4 />").text(name)); // name - title
        container.append($("<h5 />").text(`${document_type} ${formattedDocument}`)
            .prepend($('<i />').addClas('fa fa-id-card'))); // subtitle

        this.list.append(container);
        let resultContainer = $("<ol />");
        resultContainer.append(container);

        return (description, action) => {
            resultContainer.append($('<li />').text(description).click(e => {
                e.preventDefault();
                if (action) action();
            }));
        };
    }

    get element() {
        return this.global;
    }

}
