module.exports = function (controller) {

    controller.registerBootstrap("network", (cb) => {
        cb();

        let result = controller.call("result"),
            [section, results, actions] = controller.call("section", "Network", "VIS JS");

        $(".app-content").append(section);
        results.append(result.element());

        let [network, networkElem] = result.addNetwork([
            {id: 1, label: 'Node 1', title: 'I have a popup!', group: 'users'},
            {id: 2, label: 'Node 2', title: 'I have a popup!', group: 'users'},
            {id: 3, label: 'Node 3', title: 'I have a popup!', group: 'users'},
            {id: 4, label: 'Node 4', title: 'I have a popup!', group: 'users'},
            {id: 5, label: 'Node 5', title: 'I have a popup!', group: 'users'}
        ],[
            {from: 1, to: 3},
            {from: 1, to: 2},
            {from: 2, to: 4},
            {from: 2, to: 5}
        ],{
            interaction: {
                hover:true
            },
            groups: {
                users: {
                    shape: 'icon',
                    icon: {
                        face: 'FontAwesome',
                        code: '\uf007',
                        size: 50,
                        color: '#f0a30a'
                    }
                }
            }
        });

        network.on("click", (params) => {
            let modal = controller.call("modal");
            modal.title("Click");
            modal.paragraph(JSON.stringify(params, null, 4));
            modal.createActions().cancel();
        });

    });

};
