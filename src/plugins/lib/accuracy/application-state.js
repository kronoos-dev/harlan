import localForage from "localforage";

const defaultState = {

};

export class ApplicationState {

    constructor(authData, callback = null) {
        this.namespace = `applicationState-u-${authData[0].id}`;
        localForage.getItem(this.namespace, (err, value) => {
            this.state = !err && value ? value : defaultState;
            if (callback) callback();
        });
    }

    configure(state) {
        this.applicationState = Object.assign({}, this.state, state);
    }

    get applicationState() {
        return this.state;
    }

    set applicationState(appState) {
        localForage.setItem(this.namespace, appState, err => {
            if (err) console.error(err);
        });
        this.state = appState;
    }

}
