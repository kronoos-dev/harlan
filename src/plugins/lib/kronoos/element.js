var KronoosElement = function(title, subtitle, sidenote) {

    var container = $("<div />").addClass("container kronoos-element-container"),
        content = $("<div />").addClass("content"),
        element = $("<div />").addClass("kronoos-element"),
        sideContent = $("<div />").addClass("kronoos-side-content full"),
        titleElement = $("<h3 />").text(title).addClass("kronoos-element-title"),
        subtitleElement = $("<h4 />").text(subtitle).addClass("kronoos-element-subtitle"),
        sidenoteElement = $("<h5 />").text(sidenote).addClass("kronoos-element-sidenote");

    sideContent.append(titleElement)
        .append(subtitleElement)
        .append(sidenoteElement);

    container.append(content.append(element.append(sideContent)));
    container.data("instance", this);

    var label = (label) => {
        return $("<label />").text(label);
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
        var table = $("<table />").addClass("multi-label"),
            thead = $("<thead />"),
            headRow = $("<tr />"),
            tbody = $("<tbody />");

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

    this.list = (name) => {
        let container = $("<div />").addClass("kronoos-list"),
            title = label(name),
            list = $("<ul />");

        sideContent.append(container.append(title).append(list));

        let addItem = (content) => {
            if (typeof content === "undefined") {
                return [title, list];
            }
            list.append($("<li />").html(content));
            return addItem;
        };

        return addItem;
    };

    this.paragraph = (content) => {
        sideContent.append($("<p />").html(content));
        return this;
    };

    this.element = () => {
        return container;
    };

    return this;
};

module.exports = (controller) => {
    controller.registerCall("kronoos::element", function() {
        return new KronoosElement(...arguments);
    });
};
