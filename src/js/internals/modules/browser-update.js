import browserUpdate from 'browser-update';

module.exports = controller => {
    controller.registerTrigger('bootstrap::end', 'browser-update', (opts, cb) => {
        cb();
        browserUpdate({vs:{i:13,f:-2,o:-2,s:9,c:-2},unsecure:true,api:4});
    });
};
