var Timeline = function() {
    var timeline = $("<ul />").addClass("timeline");

    this.add = (time, header, details, actions, obj = {}) => {
        obj.item = $("<li />");

        obj.header = $("<div />").addClass("header");
        obj.details = $("<div />").addClass("details").html(details);

        if (!moment.isMoment(time)) {
            time = moment.unix(time);
        }

        obj.expansion = $("<span />").addClass("expand").append($("<i />").addClass("fa fa-angle-down")).click((e) => {
            e.preventDefault();
            item[item.hasClass("expanded") ? "removeClass" : "addClass"]("expanded");
        });

        obj.time = $("<span />").addClass("time").text(time.fromNow());
        obj.headerContent = $("<span />").addClass("header-content").text(header);
        obj.actions = $("<ul />").addClass("actions");

        for (let [icon, action] of actions) {
            obj.actions.append($("<li />").append($("<i />").addClass("fa " + icon)).click((e) => {
                e.preventDefault();
                action();
            }));
        }

        obj.header.append(obj.expansion);
        obj.header.append(obj.headerContent);
        obj.header.append(obj.time);
        obj.header.append(obj.actions);

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
