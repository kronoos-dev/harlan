module.exports = function () {

    describe('bipbop.controller', function () {
        describe('module', function () {
            it('register module', function (done) {
                harlan.registerCall("allahu::akbar", function () {
                    done();
                });
                harlan.call("allahu::akbar");
            });
            it('register trigger', function (done) {
                harlan.registerTrigger("allahu::akbar", "allahu::akbar", function () {
                    done();
                });
                harlan.trigger("allahu::akbar");
            });
        });
    });

};
