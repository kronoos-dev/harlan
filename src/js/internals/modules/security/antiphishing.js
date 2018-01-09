module.exports = controller => {

    const position = e => {

        //this section is from http://www.quirksmode.org/js/events_properties.html
        let targ;
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

    controller.registerBootstrap('antiphishing::implement', callback => {
        callback();

        const canvas = $('.antiphishing:first');
        if (!canvas.length) return;

        const context = canvas.get(0).getContext('2d');

        if (localStorage.getItem('antiphishing')) {
            const imageObj = new Image();
            imageObj.onload = function () {
                context.drawImage(this, 0, 0);
            };

            imageObj.src = localStorage.getItem('antiphishing');
        }

        let mouseMove = null;

        const onMouseMove = e => {
            context.fillStyle = 'black';
            const ps = position(e);
            context.fillRect(ps[0], ps[1], 1, 1);
            setTimeout(mouseMove);
            mouseMove = setTimeout(() => {
                localStorage.setItem('antiphishing', canvas.get(0).toDataURL());
            }, 300);
        };

        let enabled = false;
        canvas.click(e => {
            e.preventDefault();
            if (enabled) {
                canvas.off('mousemove', onMouseMove);
            } else {
                canvas.on('mousemove', onMouseMove);
            }
            enabled = !enabled;
        });

        canvas.dblclick(e => {
            context.clearRect(0, 0, canvas.width(), canvas.height());
            localStorage.setItem('antiphishing', canvas.get(0).toDataURL());
        });

    });

};
