const radialCeil = value => {
    if (!value) {
        return 0;
    }
    return (Math.round(value) * 100) / 100;
};

module.exports = (parent, percent) => {
    percent = radialCeil(percent);
    const radialProject = $('<div />').addClass('radialProject');
    const progress = $('<div />').addClass('progress');
    const progressFill = $('<div />').addClass('progressFill');
    const percents = $('<div />').addClass('percents');
    const percentsWrapper = $('<div />').addClass('percentsWrapper');
    const percentText = $('<span />').text('%');
    let deg = 360 * percent / 100;

    percents.append(percentsWrapper.append(percentText));
    progress.append(progressFill);
    radialProject.append(progress).append(percents);

    if (percent > 50) {
        radialProject.addClass('gtHalf');
    }

    progressFill.css('transform', `rotate(${deg}deg)`);
    percentText.text(`${percent.toString()} %`);

    parent.append(radialProject);
    let ret = {
        element: radialProject,
        change(percent) {
            percent = radialCeil(percent);
            deg = 360 * percent / 100;
            radialProject[percent > 50 ? 'addClass' : 'removeClass']('gtHalf');
            progressFill.css('transform', `rotate(${deg}deg)`);
            percentText.text(`${Math.floor(percent).toString()} %`);
            if (ret.onChange) ret.onChange(percent);
        },
        onChange: null
    };
    return ret;
};
