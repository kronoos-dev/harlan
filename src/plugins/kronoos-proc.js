harlan.addPlugin(controller => {

    let downloadProc = (xml) => {

        let modal = controller.call('modal');
        modal.title('Lista dos Anexos');
        modal.subtitle('Existem anexos que podem ser baixados do processo.');
        modal.paragraph('Clique sobre o resultado para abrir o anexo em uma nova janela.');
        let list = modal.createForm().createList();
        $('documentos documento', xml).each((i, htmlNode) =>
            list.item('fa-file-o', [$('data', htmlNode).text(), $('descricao', htmlNode).text()]).click(e => {
                e.preventDefault();
                modal.close();
                let downloadWindow = controller.call('modal');
                downloadWindow.gamification('accuracy');
                downloadWindow.title('Download do Anexo');
                downloadWindow.subtitle('Existem anexos que podem ser baixados do processo.');
                downloadWindow.paragraph('Clique sobre o resultado para abrir o anexo.');
                downloadWindow.createForm().addSubmit('download', 'Download').click(e => {
                    e.preventDefault();
                    downloadWindow.close();
                    window.open($('url', htmlNode).text(), '_blank');
                });
                downloadWindow.createActions().cancel();
            }));
        modal.createActions().cancel();
    };

    controller.registerTrigger('kronoos::juristek', 'kronoos::plugins::procOpen', (args, callback) => {
        let [numproc, proc, pieces, cnjInstance] = args;

        pieces.push(['Download do Processo', $('documentos documento', proc).length ? $('<a />').attr({
            href: '#',
            target: '_blank'
        }).text('Download do Processo').click((e) => {
            e.preventDefault();
            downloadProc(proc);
        }) : null]);

        callback();
    });

});
