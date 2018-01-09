module.exports = windowSelector => {
    $('body > *').addClass('hide');
    $(windowSelector).not((i, e) => $(e).parent().get(0).tagName.toLowerCase() !== 'body').removeClass('hide');
};
