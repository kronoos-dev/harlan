module.exports = function (controller) {

    var position = function (e) {

        //this section is from http://www.quirksmode.org/js/events_properties.html
        var targ;
        if (!e)
            e = window.event;
        if (e.target)
            targ = e.target;
        else if (e.srcElement)
            targ = e.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug
            targ = targ.parentNode;

        // jQuery normalizes the pageX and pageY
        // pageX,Y are the mouse positions relative to the document
        // offset() returns the position of the element relative to the document
        return [e.pageX - $(targ).offset().left, e.pageY - $(targ).offset().top];
    };

    controller.registerBootstrap('antiphishing::implement', function (callback) {
        callback();

        var canvas = $('.antiphishing:first');
        if (!canvas.length) return;

        var context = canvas.get(0).getContext('2d');

        if (localStorage.getItem('antiphishing')) {
            var imageObj = new Image();
            imageObj.onload = function () {
                context.drawImage(this, 0, 0);
            };

            imageObj.src = localStorage.getItem('antiphishing');
        }

        var mouseMove = null;

        var onMouseMove = function (e) {
            context.fillStyle = 'black';
            var ps = position(e);
            context.fillRect(ps[0], ps[1], 1, 1);
            setTimeout(mouseMove);
            mouseMove = setTimeout(function () {
                localStorage.setItem('antiphishing', canvas.get(0).toDataURL());
            }, 300);
        };

        var enabled = false;
        canvas.click(function (e) {
            e.preventDefault();
            if (enabled) {
                canvas.off('mousemove', onMouseMove);
            } else {
                canvas.on('mousemove', onMouseMove);
            }
            enabled = !enabled;
        });

        canvas.dblclick(function (e) {
            context.clearRect(0, 0, canvas.width(), canvas.height());
            localStorage.setItem('antiphishing', canvas.get(0).toDataURL());
        });

    });

};
