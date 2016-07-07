module.exports = function (controller) {

    controller.registerBootstrap("network", (cb) => {
        cb();

        let result = controller.call("result"),
            [section, results, actions] = controller.call("section", "Network", "VIS JS");

        $(".app-content").append(section);
        results.append(result.element());

        result.addNetwork([
            {id: 1, label: 'Node 1', group: 'users'},
            {id: 2, label: 'Node 2', group: 'users'},
            {id: 3, label: 'Node 3', group: 'users'},
            {id: 4, label: 'Node 4', group: 'users'},
            {id: 5, label: 'Node 5', group: 'users'}
        ],[
            {from: 1, to: 3},
            {from: 1, to: 2},
            {from: 2, to: 4},
            {from: 2, to: 5}
        ],{
            groups: {
                users: {
                    shape: 'icon',
                    icon: {
                        face: 'FontAwesome',
                        code: '\uf007',
                        size: 50
                    }
                }
            }
        });

    });

};
