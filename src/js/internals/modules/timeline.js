var Timeline = function() {
    var timeline = $("<ul />").addClass("timeline");

    this.add = (time, header, details, actions, obj = {}) => {
        obj.item = $("<li />");

        obj.header = $("<div />").addClass("timeline-header");
        obj.details = $("<div />").addClass("timeline-details").html(details);

        if (!moment.isMoment(time)) {
            time = moment.unix(time);
        }

        obj.expansionIcon = $("<i />").addClass("fa fa-angle-down");
        obj.expansion = $("<span />").addClass("timeline-expand").append(obj.expansionIcon).click((e) => {
            e.preventDefault();
            if (obj.item.hasClass("expanded")) {
                obj.item.removeClass("expanded");
                obj.expansionIcon.removeClass("fa-angle-up").addClass("fa-angle-down");
            } else {
                obj.item.addClass("expanded");
                obj.expansionIcon.addClass("fa-angle-up").removeClass("fa-angle-down");
            }
        });

        obj.time = $("<span />").addClass("timeline-time").text(time.fromNow());
        obj.headerContent = $("<span />").addClass("timeline-header-content").text(header);
        obj.actions = $("<ul />").addClass("actions");

        for (let [icon, action] of actions) {
            obj.actions.append($("<li />").append($("<i />").addClass("fa " + icon)).click((e) => {
                e.preventDefault();
                action();
            }));
        }

        obj.meta = $("<div />").addClass("timeline-meta");
        obj.meta.append(obj.time);
        obj.meta.append(obj.actions);

        obj.header.append(obj.meta);
        obj.header.append(obj.expansion);
        obj.header.append(obj.headerContent);
        obj.header.append($("<div />").addClass("clear"));

        obj.item.append(obj.header);
        obj.item.append(obj.details);

        timeline.append(obj.item.data("object", obj));

        return obj.item;
    };

    this.element = () => {
        return timeline;
    };

}

module.exports = (controller) => {
    controller.registerCall("timeline", () => {
        return new Timeline();
    });
};
