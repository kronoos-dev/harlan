/* global harlan */

var jform = harlan.store.get("socialprofile")[0];
jform.find("input[name='email']").attr("type", "email");
jform.find("input[name='documento']").mask("999.999.999-99");

harlan.store.set("socialprofile::consulta", true);

var arrayUnique = function (nav_array) {
    /* http://stackoverflow.com/questions/13486479/how-to-get-an-array-of-unique-values-from-an-array-containing-duplicates-in-java */
    nav_array = nav_array.sort(function (a, b) {
        return a * 1 - b * 1;
    });
    var ret = [nav_array[0]];
    // Start loop at 1 as element 0 can never be a duplicate
    for (var i = 1; i < nav_array.length; i++) {
        if (nav_array[i - 1] !== nav_array[i]) {
            ret.push(nav_array[i]);
        }
    }
    return ret;
};

var parsePhoto = function (result, document) {
    var photos = [];

    document.find("BPQL > body photos > url").each(function (idx, node) {
        photos.push($(node).text());
    });

    document.find("*[profileImage]").each(function (node) {
        photos.push($(node).attr("profileImage"));
    });

    if (!photos.length)
        return;

    result.addItem().addClass("photo").css("background-image", "url(" + photos[0] + ")");
};

var socialNetwork = function (result, jdocument) {
    var profiles = jdocument.find("BPQL > body socialProfiles > socialProfiles");

    if (!profiles.length) {
        return;
    }

    result.addSeparator("Redes Sociais", "Perfis na Internet", "Referência de perfis sociais");
    profiles.each(function (idx, node) {
        var jnode = $(node);
        var element = result.addItem("Perfil", jnode.find("typeName").text());
        element.prepend($("<a />").attr({
            target: "_blank",
            href: jnode.find("url").text(),
            title: "typeName"
        }).append(element.find(".value")));
    });
};

var setContact = function (result, jdocument) {
    var phones = [];
    var emails = [];

    jdocument.find("BPQL > body > phones > phone:lt(3)").each(function (idx, node) {
        var jnode = $(node);
        phones.push("(" + jnode.find("area-code").text() + ") " + jnode.find("number").text());
    });

    jdocument.find("BPQL > body email:lt(3)").each(function (idx, node) {
        emails.push($(node).text());
    });

    if (!phones.length && !emails.length) {
        return;
    }

    phones = arrayUnique(phones);
    emails = arrayUnique(emails);

    result.addSeparator("Contato", "Meios de contato", "Telefone, e-mail e outros");
    for (var idxPhones in phones) {
        result.addItem("Telefone", phones[idxPhones]);
    }

    for (var idxEmails in emails) {
        result.addItem("Email", emails[idxEmails]);
    }
};

var addMap = function (result, jdocument) {
    var address = [];

    result.block();

    jdocument.find("BPQL > body > addresses address").first().find("*").each(function (idx, node) {
        var jnode = $(node);
        if (!/(address|number|address-complement|bairro)/.test(jnode.prop("tagName")))
            address.push(jnode.text());
    });

    var width = window.innerWidth - 90;

    var mapUrl = "http://maps.googleapis.com/maps/api/staticmap?" + $.param({
        "scale": "1",
        "size": (width < 120 ? 120 : width).toString() + "x150",
        "maptype": "roadmap",
        "format": "png",
        "visual_refresh": "true",
        "markers": "size:mid|color:red|label:1|" + address.join(", ")
    });

    result.addItem("Localização Aproximada", "").addClass("map").find(".value").append(
            $("<a />").attr({
        "href": "https://www.google.com/maps?" + $.param({
            q: address.join(", ")
        }),
        "target": "_blank"
    }).append($("<img />").attr("src", mapUrl)));
};

harlan.importXMLDocument.register("SOCIALPROFILE", "CONSULTA", function (document) {
    var result = harlan.call("generateResult");
    var jdocument = $(document);

    var generateAlert = function (element, percent, context) {
        context = context || {
            60: "attention",
            80: "warning"
        };
        var styleDefinition = null;
        for (var minPerc in context) {
            console.log([percent < parseInt(minPerc), percent, parseInt(minPerc)]);
            if (percent < parseInt(minPerc)) {
                break;
            }
            styleDefinition = context[minPerc];
        }

        if (styleDefinition) {
            element.addClass(styleDefinition);
        }

        return element;
    };

    var generateRadial = function (name, percent, context) {
        if (percent <= 0)
            return;
        var item = result.addItem(name, "").addClass("center"),
                itemValue = item.find(".value"),
                widget = harlan.interface.widgets.radialProject(itemValue, percent);
        return generateAlert(widget, percent, context);
    };


    parsePhoto(result, jdocument);

    var bio = null;
    var bioNode = jdocument.find("BPQL > body bio").first();
    if (bioNode.length) {
        bio = bioNode.text();
    }
    result.addItem(bio || "Nome", jdocument.find("BPQL > body > name, BPQL > body> fullName").first().text());

    result.addItem("Idade Aproximada", jdocument.find("approximate-age").first().text()).addClass("center");
    result.addItem("Critério", jdocument.find("criteria").first().text()).addClass("center");

    result.addItem("Média E-commerce", "R$" + jdocument.find("BPQL > body > buy-avg").text());
    result.addItem("Máximo E-commerce", "R$" + jdocument.find("BPQL > body > buy-limit").text());
    result.block();
    generateRadial("Risco Social", parseInt(jdocument.find("BPQL > body > social-risk").text()));
    generateRadial("Influência", parseInt(jdocument.find("BPQL > body > influence").text()));
    generateRadial("Risco Jurídico", parseInt(jdocument.find("BPQL > body > juridic-risk").text()));
    generateRadial("Confiança", parseInt(jdocument.find("BPQL > body > confidence").text()), {
        0: "warning",
        50: "attention",
        70: null
    });

    addMap(result, jdocument);

    /* Generate Social Network */
    setContact(result, jdocument);
    socialNetwork(result, jdocument);

    return result.generate();
});

socialprofile();
