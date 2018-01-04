export class ClientLoader {

    constructor(element = null) {
        this.container = $('<div />').addClass('modal');
        this.row = $('<div />');
        this.cell = $('<div />');
        this.modal = $('<div />').addClass('modal-content');
        this.appProgress = $('<div />').addClass('app-progress');
        this.percentage = $('<div />').addClass('perc');
        this.progress = $('<span />').addClass('progress');


        this.container.append(this.row
            .append(this.cell
                .append(this.modal
                    .append(this.appProgress
                        .append(this.progress)
                        .append(this.percentage)))));
        this.render();
        (element || $('body')).prepend(this.container);
    }

    render(perc = 0) {
        this.progress = `${Math.ceil(perc)*100}%`;
        this.percentage.css({width: perc*100});
    }

    close() {
        this.container.remove();
    }
}
