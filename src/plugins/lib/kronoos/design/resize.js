module.exports = () => {
    var resize = function() {
        $("body > .kronoos-site .call-to-action").css({
            "height": window.innerHeight
        });
    };

    $(window).resize(resize);
    resize();
};
