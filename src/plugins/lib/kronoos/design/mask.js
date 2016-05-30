module.exports = (controller) => {

    $("#kronoos-q").mask("000.000.000-00", {
        onKeyPress: (input, e, field, options) => {
            var masks = ['000.000.000-009', '00.000.000/0000-00'],
                mask = (input.length > 14) ? masks[1] : masks[0];
            field.mask(mask, options);
        }
    });

};
