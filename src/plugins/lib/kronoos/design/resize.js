module.exports = () => {
    var resize = function() {
        $('.kronoos-site .call-to-action, .kronoos-application .search-bar.full').css({
            'height': window.innerHeight
        });
    };

    $(window).resize(resize);
    resize();
};
