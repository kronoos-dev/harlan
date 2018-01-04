const LIMIT = 5;

import truncate from 'truncate';

module.exports = controller => {

    controller.registerCall('dive::history', entity => {
        let skip = 0,
            modal = controller.call('modal');
        modal.gamification();
        modal.title('Atualização da Cobrança');
        modal.subtitle('Arquivo de Contato com o Cliente');
        modal.paragraph('É importante manter um histórico do que houve no contato com o cliente, por favor, conte para nós.');
        let list = modal.createForm().createList(),
            actions = modal.createActions();
        actions.add('Novo Contato').click(controller.click('dive::history::new', entity, (e) => more(entity, 0, e)));
        let more,
            observation = actions.observation('Carregando'),
            backButton = actions.add('Voltar Página').click(e => more(e, -1)),
            nextButton = actions.add('Próxima Página').click(e => more(e));

        more = (e, direction = 1, newEntity = null) => {
            if (newEntity) entity = newEntity;
            if (e) e.preventDefault();
            skip += LIMIT * direction;
            list.empty();
            if (!entity.history || !entity.history.length) {
                controller.call('dive::history::new', entity);
                modal.close();
                return;
            }

            let pages = Math.ceil(entity.history.length / LIMIT),
                page = (skip ? skip / LIMIT : 0) + 1;

            nextButton[page == pages ? 'hide' : 'show']();
            backButton[page == 1 ? 'hide' : 'show']();
            observation.text(`Página ${page} de ${pages}`);

            let open = (when, contact) => e => {
                e.preventDefault();
                let modal = controller.call('modal');
                modal.title('Atualização da Cobrança');
                modal.subtitle(`Histórico do Contato ${when.format('LLLL')}`);
                modal.paragraph(contact.observation);
            };

            for (let contact of entity.history.slice(skip, skip + LIMIT)) {
                let when = moment.unix(contact.when),
                    next = moment.unix(contact.next);

                list.item('fa-archive', [
                    truncate(contact.observation, 40),
                    when.fromNow()
                ]).click(open(when, contact));
            }
        };

        more(null, 0);
        actions.cancel();
    });


    controller.registerCall('dive::history::new', (entity, callback) => {
        let modal = controller.call('modal');
        modal.gamification();
        modal.title('Histórico de Contato');
        modal.subtitle('Arquivo de Contato com o Cliente');
        modal.paragraph('É importante manter um histórico do que houve no contato com o cliente, por favor, conte para nós.');
        let form = modal.createForm();
        let date = form.addInput('date', 'text', 'Data do Próximo Contato').mask('00/00/0000').pikaday(),
            observation = form.addTextarea('observation', 'O que houve no contato?');
        form.addSubmit('submit', 'Enviar');
        form.element().submit(e => {
            e.preventDefault();
            let error = false,
                when = moment(date.val(), 'DD/MM/YYYY');
            if (!when.isValid() || moment().isAfter(when)) {
                date.addClass('error');
                error = true;
            } else date.removeClass('error');
            if (/^\s*$/.test(observation.val())) {
                observation.addClass('error');
                error = true;
            } else observation.removeClass('error');
            if (error) return;

            modal.close();
            controller.server.call('INSERT INTO \'DIVE\'.\'HISTORY\'', {
                dataType: 'json',
                type: 'POST',
                data: {
                    when: when.unix(),
                    observation: observation.val(),
                    label: entity.label
                },
                success : ret => {
                    entity.history = ret.history;
                    if (callback) callback(ret);
                    else toastr.success('Histórico de cobrança adicionado com sucesso.',
                        'Foi registrado com sucesso o evento de contato com o cliente.');
                }
            });
        });
        modal.createActions().cancel();
    });
};
