module.exports = function (controller) {

    var xhr;
    var items = [];


    controller.registerTrigger("findDatabase::instantSearch", "findCompany::instantSearch", function (args, callback) {
        if (xhr && xhr.readyState != 4) {
            xhr.abort();
        }

        for (var i in items) {
            items[i].remove();
        }

        if (!/^[a-z]{3,}[a-z\s*]/i.test(args[0])) {
            callback();
            return;
        }

        xhr = controller.serverCommunication.call("SELECT FROM 'HARLANAUTOCOMPLETER'.'QUERY'", {
            data: {
                search: args[0].toUpperCase()
            },
            success: function (ret) {
                $(ret).find("autocompleter node").each(function (idx, obj) {
                    var id = $(obj).find("_id").text();
                    id = id.substring(0, 14 - id.length) + id;
                    id = id.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
                    items.push(args[1].item(
                            $(obj).find("name").text(),
                            "CNPJ " + id)
                            .addClass("company")
                            .click(function () {
                                args[1].input().val(id);
                                args[1].empty();
                                $("#main-search").submit();
                            }));
                });
            },
            complete: function () {
                callback();
            }
        });
    });
};