module.exports = (controller) => {
    controller.interface.helpers.menu.add("Imprimir", "print").nodeLink.click((e) => {
        e.preventDefault();
        window.print();
    });
};
