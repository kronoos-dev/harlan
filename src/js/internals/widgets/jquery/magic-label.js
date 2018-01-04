var magicLabel = function (element, elementLabel) {
    return function () {
        if (element.val() === '') {
            elementLabel.addClass('magic-label-hide').removeClass('magic-label-show');
        } else {
            elementLabel.removeClass('magic-label-hide').addClass('magic-label-show');
        }
    };
};

$.fn.extend({
    magicLabel: function (elementLabel) {
        this.each(function () {
            var element = $(this);
            var elementLabel = elementLabel || $('label[for=\'' + element.attr('id') + '\']');
            if (!elementLabel.length) {
                return;
            }

            var fnc = magicLabel(element, elementLabel);
            fnc();

            element.on('unmask', fnc);
            element.change(fnc);
            element.keyup(fnc);

        });
        return this;
    }
});