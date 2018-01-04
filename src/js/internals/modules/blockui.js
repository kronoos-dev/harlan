module.exports = function (controller) {

    /* Mensagem default de GPS */
    controller.registerCall('blockui', (args = {}) => {

        let opts = {};

        opts.mainContainer = $('<div />').css({
            'position': 'fixed',
            'top': '0',
            'left': '0',
            'z-index': '9999999',
            'width': '100%',
            'height': '100%',
            'background-color': args.colorString || 'rgba(255, 148, 14, 0.95)',
            'color': args.fontColor || '#fff',
        });

        opts.icon = $('<i />').addClass(`fa ${args.icon || 'fa-location-arrow'} ${args.animation || 'shake-slow shake-constant'}`).css({
            'height': '60px',
            'width': '60px',
            'top': '50%',
            'left': '50%',
            'font-size' : '60px',
            'margin-top': '-30px',
            'margin-left': '-30px',
            'position' : 'fixed',
            'text-shadow': `1px 1px ${args.shadowColor || '#000'}`,
        });

        opts.message = $('<h3>').css({
            'position': 'fixed',
            'text-align': 'center',
            'width': '100%',
            'padding': '20px',
            'box-sizing': 'border-box',
            'font-size': '19px',
            'bottom': '0',
            'line-height': '140%',
            'font-weight': '600',
            'letter-spacing': '2.2px',
        }).text(args.message || 'Aguarde enquanto capturamos sua localização.');

        $(controller.confs.container).append(opts.mainContainer.append(opts.icon).append(opts.message));
        return opts;
    });
};
