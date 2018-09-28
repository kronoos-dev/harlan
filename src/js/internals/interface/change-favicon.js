module.exports = href => {
    $('head > link[rel=\'shortcut icon\']').attr('href', href);
};