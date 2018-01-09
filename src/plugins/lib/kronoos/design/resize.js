module.exports = () => {
    var resize = () => {
        $('.kronoos-site .call-to-action, .kronoos-application .search-bar.full').css({
            height: window.innerHeight
        });
    };

    $(window).resize(resize);
    resize();
};
