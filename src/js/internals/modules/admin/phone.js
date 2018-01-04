module.exports = controller => {
    controller.registerCall('admin::phone', (username, section) => {
        var modal = controller.call('modal');
        modal.title('Adicionar Telefone');
        modal.subtitle('Adicione um telefone para esta conta.');
        modal.paragraph('Os telefones são utilizados apenas para contato urgente ou tratativas comerciais.');

        var form = modal.createForm(),
            phone = form.addInput('phone', 'text', 'Telefone').mask('(00) 0000-00009'),
            pabx = form.addInput('ramal', 'text', 'Ramal').mask('0#'),
            contact = form.addInput('contato', 'text', 'Nome Contato'),
            phoneType = form.addSelect('phoneType', 'Tipo do phone', controller.call('admin::contactTypes'));

        form.element().submit(e => {
            e.preventDefault();

            var match;
            if ((match =/\((\d{2})\)\s*(\d{4}\-\d{4,5})/.exec(phone.val())) === null) {
                phone.addClass('error');
                return;
            }

            controller.serverCommunication.call('INSERT INTO \'BIPBOPCOMPANYS\'.\'PHONE\'',
                controller.call('error::ajax', controller.call('loader::ajax', {
                    data: {
                        username: username,
                        ddd: match[1],
                        phone: match[2],
                        pabx: pabx.val(),
                        contact: contact.val(),
                        type: phoneType.val()
                    },
                    success: response => {
                        controller.call('admin::viewCompany', $(response).find('BPQL > body > company'), section, 'replaceWith');
                        modal.close();
                    }
                })));
        });
        form.addSubmit('add', 'Adicionar');
        modal.createActions().cancel();
    });
};
