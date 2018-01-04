module.exports = function (controller) {
    controller.registerCall('selectedResults', function () {
        
        var result = $('.result');
        if (result.length === 1) {
            return result;
        }
        
        var results = $('.result.selected');
        if (!results.length) {
            toastr.warning('Nenhum resultado selecionado.');
            return results;
        }
        return results;
    });
};