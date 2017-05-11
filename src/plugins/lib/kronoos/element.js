var KronoosElement = function(title, subtitle, sidenote) {

    var container = $("<div />").addClass("container kronoos-element-container"),
        content = $("<div />").addClass("content"),
        element = $("<div />").addClass("kronoos-element"),
        sideContent = $("<div />").addClass("kronoos-side-content full"),
        titleElement = $("<h3 />").text(title).addClass("kronoos-element-title"),
        subtitleElement = $("<h4 />").text(subtitle).addClass("kronoos-element-subtitle"),
        sidenoteElement = $("<h5 />").text(sidenote).addClass("kronoos-element-sidenote"),
        informationQA, alertElement, aggregate, notation, behaviour;

    sideContent.append(titleElement)
        .append(subtitleElement)
        .append(sidenoteElement);

    container.append(content.append(element.append(sideContent)));
    container.data("instance", this);

    var label = (label) => {
        return $("<label />").text(label);
    };

    this.stage = (message) => {
        if (!informationQA) {
            informationQA = {};
            this.list("Qualidade dos Dados", informationQA);
            informationQA.container.addClass("kronoos-stage");
            informationQA.container.insertAfter(sidenoteElement);
        }
        let item = {};
        informationQA.addItem(message, item);
        return item.element;
    };

    this.stageClear = () => {
        if (!informationQA) return;
        informationQA.container.remove();
        informationQA = null;
    };

    this.removeAlertElement = (hasNotation = true) => {
        if (alertElement) alertElement.remove();
        alertElement = null;
        this.behaviourAccurate();
        this.notation(hasNotation);
        return this;
    };

    this.notation = (v = null) => {
        if (v !== null) {
            if (notation) container.removeClass(notation);
            notation = v ? "hasNotation" : "hasntNotation";
            container.addClass(notation);
            if (aggregate) aggregate();
        }
        return [notation || "unknownNotation", behaviour || "unknownBehaviour"];
    };

    let dataStatus = (b, hasNotation) => {
        if (behaviour) container.removeClass(behaviour);
        behaviour = b;
        container.addClass(b);
        this.notation(hasNotation);
        if (aggregate) aggregate();
        return this;
    };

    this.behaviourUnstructured = (hasNotation) => dataStatus("behaviourUnstructured", hasNotation);
    this.behaviourHomonym = (hasNotation) => dataStatus("behaviourHomonym", hasNotation);
    this.behaviourUnstructuredHomonym = (hasNotation) => dataStatus("behaviourUnstructuredHomonym", hasNotation);
    this.behaviourAccurate = (hasNotation) => dataStatus("behaviourAccurate", hasNotation);

    this.titleAlert = (font = 'exclamation-triangle', behaviour = "behaviourUnstructured", hasNotation = true) => {
        this.removeAlertElement();
        this[behaviour]();
        this.notation(hasNotation);
        alertElement = $("<i />").addClass(`fa fa-${font}`);
        titleElement.prepend(alertElement);
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

    this.remove = () => container.remove();

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

    this.addNetwork = (nodesArray, edgesArray, options = {}) => {
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
