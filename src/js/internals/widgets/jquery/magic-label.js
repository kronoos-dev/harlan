const magicLabel = (element, elementLabel) => () => {
    if (element.val() === '') {
        elementLabel.addClass('magic-label-hide').removeClass('magic-label-show');
    } else {
        elementLabel.removeClass('magic-label-hide').addClass('magic-label-show');
    }
};

$.fn.extend({
    magicLabel(elementLabel) {
        this.each(function () {
            const element = $(this);
            const elementLabel = elementLabel || $(`label[for='${element.attr('id')}']`);
            if (!elementLabel.length) {
                return;
            }

            const fnc = magicLabel(element, elementLabel);
            fnc();

            element.on('unmask', fnc);
            element.change(fnc);
            element.keyup(fnc);

        });
        return this;
    }
});