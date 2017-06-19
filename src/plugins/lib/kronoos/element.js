var KronoosElement = function(title, subtitle, sidenote) {

    var container = $("<div />").addClass("container kronoos-element-container"),
        content = $("<div />").addClass("content"),
        element = $("<div />").addClass("kronoos-element"),
        sideContent = $("<div />").addClass("kronoos-side-content full"),
        titleElement = $("<h3 />").text(title).addClass("kronoos-element-title"),
        subtitleElement = $("<h4 />").text(subtitle).addClass("kronoos-element-subtitle"),
        sidenoteElement = $("<h5 />").text(sidenote).addClass("kronoos-element-sidenote"),
        informationQA, informations, alertElement, aggregate, notation, behaviour,
        negativeCertificates;

    sideContent.append(titleElement)
        .append(subtitleElement)
        .append(sidenoteElement);

    container.append(content.append(element.append(sideContent)));
    container.data("instance", this);

    var label = (label) => {
        return $("<label />").text(label);
    };

    this.negativeCertificateStatus = (icon, message) => {
        if (!negativeCertificates) {
            negativeCertificates = {};
            this.list("Resultados Negativos", negativeCertificates);
            negativeCertificates.container.addClass("kronoos-stage");
            negativeCertificates.container.insertAfter(sidenoteElement);
        }
        let item = {};
        negativeCertificates.addItem(`<i class="fa fa-${icon}"></i> ${message}`, item);
        return item.element;
    };

    this.negativeCertificateStatusClear = () => {
        if (!negativeCertificates) return;
        negativeCertificates.container.remove();
        negativeCertificates = null;
    };

    this.informationStatus = (icon, message) => {
        if (!informations) {
            informations = {};
            this.list("Resumo do Relatório", informations);
            informations.container.addClass("kronoos-stage");
            informations.container.insertAfter(sidenoteElement);
        }
        let item = {};
        informations.addItem(`<i class="fa fa-${icon}"></i> ${message}`, item);
        return item.element;
    };

    this.informationStatusClear = () => {
        if (!informations) return;
        informations.container.remove();
        informations = null;
    };

    this.canDelete = () => {
        /* future implementation */
        element.addClass("kronoos-can-delete");
        // element.append($("<a />").attr({href: "#"})
        //     .append($("<i />").addClass("fa fa-times"))
        //     .addClass("kronoos-delete-element")
        //     .click((e) => {
        //         e.preventDefault();
        //         this.remove();
        //     }));
    };

    this.stage = (icon, message) => {
        if (!informationQA) {
            informationQA = {};
            this.list("Qualidade dos Dados", informationQA);
            informationQA.container.addClass("kronoos-stage");
            informationQA.container.insertAfter(sidenoteElement);
        }
        let item = {};
        informationQA.addItem(`<i class="fa fa-${icon}"></i> ${message}`, item);
        return item.element;
    };

    this.stageClear = () => {
        if (!informationQA) return;
        informationQA.container.remove();
        informationQA = null;
    };

    this.notation = (v = null, change = false) => {
        if (v !== null) {
            let notationClass = v ? "hasNotation" : "hasntNotation";
            if (notationClass !== notation) {
                if (notationClass === "hasNotation" && this.brief) {
                    this.briefElement = this.brief(`${titleElement.text()} <small>${subtitleElement.text()}</small>`, () => {
                        titleElement.closest(".record").find(".kronoos-header .fa-plus-square-o").click();
                        $('html, body').scrollTop(titleElement.offset().top);
                    });
                }
                if (notationClass) container.removeClass(notationClass);
                notation = notationClass;
                container.addClass(notation);
                change = true;
            }
        }
        if (aggregate && change) aggregate();
        return [notation || "unknownNotation", behaviour || "unknownBehaviour", change];
    };

    this.dataStatus = (b, hasNotation) => {
        if (b !== behaviour) {
            if (behaviour) container.removeClass(behaviour);
            behaviour = b;
            container.addClass(b);
            return this.notation(hasNotation, true);
        }
        return this.notation(hasNotation, false);
    };

    this.behaviourUnstructured = (hasNotation) => this.titleAlert('question-circle', "behaviourUnstructured", hasNotation);
    this.behaviourHomonym = (hasNotation) => this.titleAlert('question-circle', "behaviourHomonym", hasNotation);
    this.behaviourUnstructuredHomonym = (hasNotation) => this.titleAlert('question-circle', "behaviourUnstructuredHomonym", hasNotation);
    this.behaviourAccurate = (hasNotation) => this.titleAlert(null, "behaviourAccurate", hasNotation);

    this.briefElement = null;
    this.titleAlert = (font = 'exclamation-triangle', behaviour = "behaviourUnstructured", hasNotation = true) => {
        let [,, change] = this.dataStatus(behaviour, hasNotation);
        if (!change) return this;

        if (alertElement) {
            alertElement.remove();
            alertElement = null;
        }

        if (!font && hasNotation) {
            font = 'exclamation-triangle';
        }

        if (font) {
            alertElement = $("<i />").addClass(`fa fa-${font}`);
            titleElement.prepend(alertElement);
        }

        return this;
    };

    this.title = (text) => {
        titleElement.text(text);
        return this;
    };

    this.sidenote = (text) => {
        sidenoteElement.text(text);
        return this;
    };

    this.subtitle = (text) => {
        subtitleElement.text(text);
        return this;
    };

    this.header = (document, name, date, hour) => {
        this.table("Data", "Hora")(date, hour)().addClass("kronoos-header").insertAfter(sidenoteElement);
        this.table("Nome", "Documento")(name, document)().addClass("kronoos-header").insertAfter(sidenoteElement);
        return this;
    };

    this.table = (...header) => {
        return this.captionTable(null, ...header);
    };

    this.remove = () => {
        container.remove();
        if (aggregate) aggregate();
    };

    this.captionTable = (caption, ...header) => {
        var table = $("<table />").addClass("multi-label"),
            thead = $("<thead />"),
            headRow = $("<tr />"),
            tbody = $("<tbody />");

        if (caption) {
            table.append($("<caption />").text(caption));
        }

        for (let item of header) {
            headRow.append($("<td />").append(label(item)));
        }

        table.append(thead.append(headRow)).append(tbody);

        let addItem = (...items) => {
            if (!items.length) {
                return table;
            }

            let row = $("<tr />");
            for (let item of items) {
                row.append($("<td />").html(item));
            }
            tbody.append(row);
            return addItem;
        };

        sideContent.append(table);

        return addItem;
    };

    this.networkOptions = {
        physics: {
            enabled: false
        }
    };

    this.addNetwork = (nodesArray, edgesArray, options = null) => {
        options = options || this.networkOptions;
        let elem = $("<div />").addClass("result-network"),
            network = new vis.Network(elem.get(0), {
                nodes: nodesArray,
                edges: edgesArray
            }, options);
        element.append(elem);
        return [network, elem];
    };

    this.picture = (url) => {
        var image = new Image();
        image.onload = () => {
            let picture = $("<div />")
                .addClass("kronoos-picture")
                .css("background-image", `url(${url})`);
            sideContent.removeClass("full");
            $("<div />").addClass("kronoos-side-picture").append(picture).insertBefore(sideContent);
        };
        image.src = url;
    };

    this.list = (name, obj = {}) => {
        let container = $("<div />").addClass("kronoos-list"),
            title = label(name),
            list = $("<ul />");

        obj.container = container;
        obj.title = title;
        obj.list = list;

        sideContent.append(container.append(title).append(list));

        let addItem = (content, item = {}) => {
            item.element = $("<li />").html(content);
            list.append(item.element);
            return addItem;
        };

        obj.addItem = addItem;

        return addItem;
    };

    this.paragraph = (content) => {
        sideContent.append($("<p />").html(content));
        return this;
    };

    this.clear = () => {
        sideContent.empty();
        sideContent.append(titleElement)
            .append(subtitleElement)
            .append(sidenoteElement);
        return this;
    };

    this.element = () => {
        return container;
    };

    this.aggregate = (callback) => {
        aggregate = callback;
    };

    return this;
};

module.exports = (controller) => {
    controller.registerCall("kronoos::element", function() {
        return new KronoosElement(...arguments);
    });
};
