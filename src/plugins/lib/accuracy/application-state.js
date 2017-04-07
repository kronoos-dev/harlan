const defaultState = {

};

export class ApplicationState {

    constructor(authData) {
        this.namespace = `applicationState-u-${authData[0].id}`;
        this.state = localStorage[this.namespace] ?
            JSON.parse(localStorage[this.namespace]) : defaultState;
    }

    configure(state) {
        this.applicationState = Object.assign({}, this.state, state);
    }

    get applicationState() {
        return this.state;
    }

    set applicationState(appState) {
        localStorage[this.namespace] = JSON.stringify(appState);
        this.state = appState;
    }

}
