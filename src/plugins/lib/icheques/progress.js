module.exports = function(controller) {
    let graphicalProgress, lastEmptyCheckCounter;

    let bootstrap = (data, callback) => {
        if (callback) callback(); /* no block */
        let checkCounter = controller.database.exec(`SELECT COUNT(1) FROM ICHEQUES_CHECKS WHERE
            QUERY_STATUS IS NULL AND EXPIRE > '${moment().format('YYYYMMDD')}'`)[0].values[0][0];
        if (!checkCounter) {
            /* no running jobs */
            if (graphicalProgress) {
                graphicalProgress.element().remove();
                graphicalProgress = null;
            }
            lastEmptyCheckCounter = null;
            return;
        }

        if (checkCounter > lastEmptyCheckCounter) {
            lastEmptyCheckCounter = checkCounter;
        }

        let progress = (lastEmptyCheckCounter - checkCounter) / lastEmptyCheckCounter;
        if (!graphicalProgress) {
            graphicalProgress = controller.call('progress::ui::noblock');
            graphicalProgress.element().dblclick(e => {
                e.preventDefault();
                graphicalProgress.element().remove();
                graphicalProgress = null;
            });
        }

        graphicalProgress.change(progress * 100);
    };

    controller.registerTrigger('icheques::update', bootstrap);

};
