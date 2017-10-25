export class CognitiveDossier {

    /*
     * O Parser é o primeiro filtro de dados, ele captura todas as requisições do dossiê,
     * aqui dentro todas as informações são compreendidas
     */
    constructor(parser) {
            this.parser = parser;
    }

    generateOutput (callback) {
        this.parser.controller.trigger("kronoos::congitiveDossier", [callback, this]);
        callback("Risco de Crédito", 0.01, "Mussum Ipsum, cacilds vidis litro abertis. Interessantiss quisso pudia ce receita de bolis, mais bolis eu num gostis. Casamentiss faiz malandris se pirulitá. A ordem dos tratores não altera o pão duris. Posuere libero varius. Nullam a nisl ut ante blandit hendrerit. Aenean sit amet nisi.");
        callback("Risco Trabalhista", 0.005, "Mussum Ipsum, cacilds vidis litro abertis. Interessantiss quisso pudia ce receita de bolis, mais bolis eu num gostis. Casamentiss faiz malandris se pirulitá. A ordem dos tratores não altera o pão duris. Posuere libero varius. Nullam a nisl ut ante blandit hendrerit. Aenean sit amet nisi.");
        callback("Risco Político", 0.2, "Mussum Ipsum, cacilds vidis litro abertis. Interessantiss quisso pudia ce receita de bolis, mais bolis eu num gostis. Casamentiss faiz malandris se pirulitá. A ordem dos tratores não altera o pão duris. Posuere libero varius. Nullam a nisl ut ante blandit hendrerit. Aenean sit amet nisi.");
        callback("Risco PT", 0.7, "Mussum Ipsum, cacilds vidis litro abertis. Interessantiss quisso pudia ce receita de bolis, mais bolis eu num gostis. Casamentiss faiz malandris se pirulitá. A ordem dos tratores não altera o pão duris. Posuere libero varius. Nullam a nisl ut ante blandit hendrerit. Aenean sit amet nisi.");
        callback("Risco PSDB", 0.2, "Mussum Ipsum, cacilds vidis litro abertis. Interessantiss quisso pudia ce receita de bolis, mais bolis eu num gostis. Casamentiss faiz malandris se pirulitá. A ordem dos tratores não altera o pão duris. Posuere libero varius. Nullam a nisl ut ante blandit hendrerit. Aenean sit amet nisi.");
    }

}

/* https://www.letras.mus.br/the-naked-and-famous/1701151/traducao.html */
