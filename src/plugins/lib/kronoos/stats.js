import {CPF, CNPJ} from 'cpf_cnpj';

export class KronoosStats {

    constructor() {
        this.elements = {};
        this.global = $("<div />").addClass("kronoos-resume");
        this.container = $("<div />").addClass("container");
        this.content = $("<div />").addClass("content");
        this.content.append($("<h3 />").text("Sumário de Apontamentos"));
        this.list = $("<ul />");
        this.global.append(this.container.append(this.content.append(this.list)));
    }

    create(name, document, click) {
        let container = $("<li />");
        let formattedDocument, documentType;

        if (CPF.isValid(document)) {
            formattedDocument = CPF.format(document);
            documentType = 'CPF';
        } else {
            formattedDocument = CNPJ.format(document);
            documentType = 'CNPJ';
        }
        let nameElement = $("<h4 />").text(name);
        container.append(nameElement); // name - title
        nameElement.click(e => {
            e.preventDefault();
            if (click) click();
        });
        container.append($("<h5 />").text(`${documentType} ${formattedDocument}`)
            .prepend($('<i />').addClass('fa fa-id-card'))); // subtitle

        this.list.append(container);
        let resultContainer = $("<ol />");
        container.append(resultContainer);

        return [(description, action) => {
            let e = $('<li />').html(description).click(e => {
                e.preventDefault();
                if (action) action();
            });
            resultContainer.append(e);
            return e;
        }, container];
    }

    get element() {
        return this.global;
    }

}
