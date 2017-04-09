const LENGTH_REGEX = /%+/g;
const JOB_REGEX = /%([^%]+)/;

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
        }
        this.sync(registerTask);
    }

    stop() {
        /* stop and unregister */
        this.stop = true;
    }

    getTask() {
        /* Captura uma tarefa */
        let job = localStorage.syncTasks.match(JOB_REGEX);
        if (!job) return null;
        return [job[1], JSON.parse(localStorage[job[1]])];
    }

    queueLength() {
        /* Captura o tamanho da fila */
        return (localStorage.syncTasks.match(LENGTH_REGEX) || []).length;
    }

    sync(callback = null, taskCallback = null) {
        /* Andei pensando e enviar um de cada vez é melhor que enviar
           todos juntos em paralelo, grandes tarefas não podem
           usar o localStorage. E como o uso disso é no mobile,
           não quero esgotar a banda da pessoa e começar a ter problemas */
        if (callback) this.callbacks.push(callback);
        if (taskCallback) this.taskCallbacks.push(taskCallback);
        if (this.running) return;

        this.stop = false;
        this.running = true;
        while (queueLength()) {
            try {
                let [jobId, job] = getTask();
                let [call, parameters] = job;
                this.controller.call(call, ...parameters);
                drop(jobId);
                if (this.stop) break;
            } catch (e) {
                /* continue */
            } finally {
                for (let cb of this.taskCallbacks) cb();
            }
        }

        for (this.callbacks) {
            for (let cb of this.callbacks) cb();
            this.callbacks = [];
            this.taskCallbacks = [];
        }

        this.running = false;
    }

    progressHelper(cb) {
        /* Envia para o callback o progresso da operação, útil para barras de progresso */
        var l1 = this.queueLength()
        return () => {
            let perc = (this.queueLength() / l1) * 100;
            if (perc > 100) perc = 100;
            cb(Math.floor(perc * 10) / 2, l1, this.queueLength());
        }
    }

    drop(jobId, interval = false) {
        localStorage.syncTasks = localStorage.syncTasks.replace(`%${jobId}`, '');
        delete localStorage[jobId];
    }

    job(call, ...parameters) {
        let storeString = JSON.stringify(call, parameters),
            key = `sync-task-${Guid.raw()}`;
        localStorage.syncTasks += `%${key}`;
        localStorage[key] = storeString;
    }

}
