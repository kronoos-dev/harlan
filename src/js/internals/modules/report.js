/* global module */
import gamificationIcons from './data/gamification-icons';

import Form from './lib/form';

module.exports = controller => {

    const ReportModel = function(closeable) {
        const universalContainer = $('<div />');
        const elementNews = $('<div />').addClass('report');
        const elementContainer = $('<div />').addClass('container');
        const elementActions = $('<ul />').addClass('r-actions');
        let elementContent = $('<div />').addClass('content');
        const elementResults = $('<div />').addClass('results');
        let elementOpen = null;

        universalContainer.append(elementNews.append(elementContainer
            .append(elementActions)
            .append(elementContent))
            .append(elementResults));

        const buttonElement = () => {
            if (!elementOpen) {
                elementOpen = $('<div />').addClass('open');
                elementContent.append(elementOpen);
            }
            return elementOpen;
        };

        this.newContent = () => {
            elementContent = $('<div />').addClass('content');
            elementContainer.prepend(elementContent);
            return this;
        };

        this.title = title => {
            elementContent.append($('<h2 />').text(title));
            return this;
        };

        this.subtitle = subtitle => {
            elementContent.append($('<h3 />').text(subtitle));
            return this;
        };

        this.label = content => {
            const span = $('<span />').addClass('label').text(content);
            elementContent.append(span);
            return span;
        };

        this.canvas = (width, height) => {
            width = width || 250;
            height = height || 250;
            const canvas = $('<canvas />').attr({
                width,
                height
            }).addClass('chart');
            elementContent.append(canvas);
            return canvas.get(0);
        };

        this.markers = () => {
            let list = $('<ul />').addClass('markers');
            elementContent.append(list);
            return (icon, text, action) => {
                let item;
                list.append(item = $('<li />').text(text).prepend($('<i />')
                    .addClass('fa')
                    .addClass(icon)).click(action));
                return item;
            };
        };

        this.gamification = type => {
            this.newContent();
            const icon = $('<i />')
                .addClass(gamificationIcons[type] || type)
                .addClass('gamification');
            elementContent.append(icon).addClass('container-gamification');
            return icon;
        };

        this.paragraph = text => {
            const p = $('<p />').html(text);
            elementContent.append(p);
            return p;
        };

        this.timeline = () => {
            const timeline = controller.call('timeline');
            elementContent.append(timeline.element());
            return timeline;
        };

        this.form = controller => new Form({
            element: this.content,
            close: this.close
        }, controller);

        this.button = (name, action) => {
            const button = $('<button />').text(name).click(e => {
                e.preventDefault();
                action();
            }).addClass('button');
            buttonElement().append(button);
            return button;
        };

        this.content = () => elementContent;

        this.element = () => universalContainer;

        this.newAction = (icon, action, title = null) => {
            elementActions.prepend($('<li />').append($('<i />').addClass(`fa ${icon}`)).click(e => {
                e.preventDefault();
                action();
            }).attr({title}));
            return this;
        };

        this.results = () => elementResults;

        this.result = () => {
            const result = controller.call('result');
            elementResults.prepend(result.element());
            return result;
        };

        this.action = this.newAction;

        this.close = () => {
            if (this.onClose) {
                this.onClose();
            }
            universalContainer.remove();
        };

        if (typeof closeable === 'undefined' || closeable) {
            /* closeable */
            this.newAction('fa-times', () => {
                this.close();
            });
        }

        return this;
    };

    controller.registerCall('report', (title, subtitle, paragraph, closeable) => {
        const model = new ReportModel(closeable);
        if (title) {
            model.title(title);
        }

        if (subtitle) {
            model.subtitle(subtitle);
        }

        if (paragraph) {
            model.paragraph(paragraph);
        }

        return model;
    });

};
