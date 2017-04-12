const LENGTH_REGEX = /%+/g;
const JOB_REGEX = /%([^%]+)/g;

import queue from 'async/queue';
import Guid from 'guid';

export default class Sync {

    constructor(controller) {
        this.stop = true;
        this.running = false;
        this.callbacks = [];
        this.taskCallbacks = [];
        this.controller = controller;
    }

    register(interval = 300) {
        var registerTask;
        registerTask = () => {
            if (this.stop) return;
            setTimeout(() => this.sync(registerTask), interval);
        };
        this.sync(registerTask);
    }

    unregister() {
        if (this.q) this.q.kill();
        this.q = null;
        this.stop = true;
        this.running = false;
    }

    getTasks() {
        return (function* () {
            /* Captura uma tarefa */
            if (localStorage.syncTasks) {
                let jobs = localStorage.syncTasks.match(JOB_REGEX);
                for (let job of jobs) {
                    if (!job) return null;
                    let jobid = job.replace(/^%/, '');
                    try {
                        yield [jobid, JSON.parse(localStorage[jobid])];
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        })();
    }

    queueLength() {
        /* Captura o tamanho da fila */
        if (!localStorage.syncTasks) return 0;
        return (localStorage.syncTasks.match(LENGTH_REGEX) || []).length;
    }

    sync(callback = null, taskCallback = null) {
        /* Andei pensando e enviar um de cada vez é melhor que enviar
        todos juntos em paralelo, grandes tarefas não podem
        usar o localStorage. E como o uso disso é no mobile,
        não quero esgotar a banda da pessoa e começar a ter problemas */
        this.stop = false;
        if (callback) this.callbacks.push(callback);
        if (taskCallback) this.taskCallbacks.push(taskCallback);
        if (this.running) return;

        this.running = true;

        var end = () => {
            for (let cb of this.callbacks) cb();
            this.callbacks = [];
            this.taskCallbacks = [];
            this.running = false;
        };

        if (!this.queueLength()) {
            end();
            return;
        }

        controller.trigger("sync::start");

        this.q = new queue((task, cb) => {
            this.controller.call(task.call, (err) => {
                if (!err) this.drop(task.jobId);
                cb(err);
            }, ...task.parameters);
        });

        this.q.drain = (...args) => {
            controller.trigger("sync::end", args);
            end(...args);
        };

        let tasks = this.getTasks();

        for (let task of tasks) {
            let [jobId, job] = task;
            let [call, parameters] = job;
            this.q.push({
                jobId: jobId,
                call: call,
                parameters: parameters
            }, (err) => {
                for (let cb of this.taskCallbacks) cb(err);
            });
        }

    }

    progressHelper(cb) {
        /* Envia para o callback o progresso da operação, útil para barras de progresso */
        var l1 = this.queueLength();
        return () => {
            let perc = (this.queueLength() / l1) * 100;
            if (perc > 100) perc = 100;
            cb(Math.floor(perc * 10) / 2, l1, this.queueLength());
        };
    }

    drop(jobId) {
        localStorage.syncTasks = localStorage.syncTasks.replace(`%${jobId}`, '');
        delete localStorage[jobId];
    }

    job(call, ...parameters) {
        let key = `sync-task-${Guid.raw()}`;
        localStorage[key] = JSON.stringify([call, parameters]);
        if (!localStorage.syncTasks) localStorage.syncTasks = "";
        localStorage.syncTasks += `%${key}`;
    }

}
