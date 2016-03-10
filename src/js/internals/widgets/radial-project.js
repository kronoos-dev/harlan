var radialCeil = function (value) {
    if (!value) {
        return 0;
    }
    return (Math.round(value) * 100) / 100;
};

module.exports = function (parent, percent) {
    percent = radialCeil(percent);
    var radialProject = $("<div />").addClass("radialProject"),
            progress = $("<div />").addClass("progress"),
            progressFill = $("<div />").addClass("progressFill"),
            percents = $("<div />").addClass("percents"),
            percentsWrapper = $("<div />").addClass("percentsWrapper"),
            percentText = $("<span />").text("%"),
            deg = 360 * percent / 100;

    percents.append(percentsWrapper.append(percentText));
    progress.append(progressFill);
    radialProject.append(progress).append(percents);

    if (percent > 50) {
        radialProject.addClass('gtHalf');
    }

    progressFill.css('transform', 'rotate(' + deg + 'deg)');
    percentText.text(percent.toString() + ' %');

    parent.append(radialProject);
    return {
        element: radialProject,
        change: function (percent) {
            percent = radialCeil(percent);
            deg = 360 * percent / 100;
            radialProject[percent > 50 ? "addClass" : "removeClass"]('gtHalf');
            progressFill.css('transform', 'rotate(' + deg + 'deg)');
            percentText.text(Math.floor(percent).toString() + ' %');
        }
    };
};
