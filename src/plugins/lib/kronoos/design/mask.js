import VMasker from 'vanilla-masker';

module.exports = (controller) => {

    const masks = ['999.999.999-99', '99.999.999/9999-99'],
        kronoosInput = $("#kronoos-q"),
        mask = () => {
            let v = kronoosInput.val();
            kronoosInput.val(VMasker.toPattern(v, masks[v.length > 14 ? 1 : 0]));
        };

    kronoosInput.on('keydown', mask);
    kronoosInput.on('paste', mask);
};
