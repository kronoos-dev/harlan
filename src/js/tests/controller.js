module.exports = () => {

    describe('bipbop.controller', () => {
        describe('module', () => {
            it('register module', done => {
                harlan.registerCall('allahu::akbar', () => {
                    done();
                });
                harlan.call('allahu::akbar');
            });
            it('register trigger', done => {
                harlan.registerTrigger('allahu::akbar', 'allahu::akbar', () => {
                    done();
                });
                harlan.trigger('allahu::akbar');
            });
        });
    });

};
