const Menu = function () {

    this.add = (title, icon) => {
        const elementId = `action-${title}`;
        const elementIcon = $('<i />').addClass(`fa fa-${icon}`);
        const elementLink = $('<a />').attr({
            href: '#',
            id: elementId
        });

        const elementItem = $('<li />');
        const elementTooltip = $('<div />').attr({
            class: 'mdl-tooltip',
            for: elementId
        }).text(title);

        elementItem
            .append(elementLink.append(elementIcon))
            .append(elementTooltip);

        $('.module-menu').append(elementItem);

        componentHandler.upgradeElement(elementTooltip.get(0), 'MaterialTooltip');
        
        return {
            nodeLink: elementLink,
            nodeItem: elementItem,
            nodeTooltip: elementTooltip
        };
    };

    return this;
};

module.exports = new Menu();
