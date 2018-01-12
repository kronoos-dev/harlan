import async from 'async';
import Promise from 'bluebird';

const notificationInterval = 1500;
const searchBarContainer = $('.kronoos-application .search-bar .kronoos-floating');

if (Notification) Notification.requestPermission();

module.exports = controller => {

    let notificationTimeout;

    let ajaxQueue = async.priorityQueue((task, callback) => {
        let [target, conf, ...args] = task.call;

        if (conf.statusElement)
            searchBarContainer.append(conf.statusElement.addClass('processing'));

        let jqXHR = task.parser.controller.server.call(target, controller.call('error::ajax', conf, false), ...args);
        Promise.resolve()
            .then(() => jqXHR)
            .then(() => task.parser.controller.server.call(target, controller.call('error::ajax', conf, false), ...args))
            .catch(e => {
                if (!(e instanceof Error)) return;
                if (conf.complete) conf.complete();
                if (task.parser && task.parser.errorHappenQuery) {
                    task.parser.errorHappenQuery(target);
                } else {
                    toastr.error(e);
                }})
            .finally(() => {
                if (!task.parser) return;
                let idx = task.parser.xhr.indexOf(jqXHR);
                if (idx !== -1) delete task.parser.xhr[idx];
                controller.trigger('kronoos::ajax::queue::change');
            })
            .finally(() => callback && callback());

        if (task.parser) task.parser.xhr.push(jqXHR);
    }, 5);

    controller.registerCall('kronoos::queue', () => {
        return ajaxQueue.length() + ajaxQueue.running();
    });

    controller.registerCall('kronoos::ajax::queue::remove', filter => {
        ajaxQueue.remove(filter);
        controller.trigger('kronoos::ajax::queue::change');
    });

    controller.registerCall('kronoos::ajax::queue', (task, priority) => {
        clearTimeout(notificationTimeout);
        ajaxQueue.push(task);
        controller.trigger('kronoos::ajax::queue::change');
    });

    /* Progress Monitor */

    let radialProject;
    let maxQueue = 0;

    /* onEnd */
    ajaxQueue.drain = () => {
        notificationTimeout = setTimeout(() => {
            maxQueue = 0;
            if (radialProject) radialProject.element.remove();
            radialProject = null;
            if (Notification && Notification.permission == 'granted') {
                let notification = new Notification('Processamento concluído do Kronoos concluído!', {
                    icon: 'images/kronoos/notification.png',
                    body: 'Boas novas! Terminamos de processar o documento informado.',
                });
                notification.onclick = () => {
                    parent.focus();
                    window.focus();
                    notification.close();
                };
            }
            controller.trigger('kronoos::end');
        }, notificationInterval);
    };

    controller.registerTrigger('kronoos::ajax::queue::change', 'radialProject', (obj, cb) => {
        cb();
        let queue = ajaxQueue.length() + ajaxQueue.running();
        if (!radialProject && !queue) return;
        if (!radialProject) radialProject = controller.call('progress::ui::noblock');

        if (queue > maxQueue) maxQueue = queue;

        if (!maxQueue) {
            radialProject.change(100);
            return;
        }

        let solved = maxQueue - queue;

        if (!solved) {
            radialProject.change(0);
            return;
        }

        radialProject.change((solved / maxQueue) * 100.0);
    });

};
