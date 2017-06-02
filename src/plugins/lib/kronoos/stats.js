class KronoosStats {

    constructor() {
        this.elements = {};
        this.global = $("<div />").addClass("kronoos-stats");
        this.container = $("<div />").addClass("container");
        this.content = $("<div />").addClass("content");
        this.global.append(this.container.append(this.content));
    }

    register(e) {
        let element = {
            data: e,
            elements: []
        };

        this.elements[e.cpf_cnpj] = element;

        return (kelement) => {
            element.elements.push(kelement);
        };
    }

    get element() {
        return this.global;
    }
}

module.exports = function (controller) {

    controller.registerCall("kronoos::stats", () => {
        return new KronoosStats();
    });

};
