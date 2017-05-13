import 'babel-polyfill';
import 'es6-shim';
import 'dom4';

import I18n from './internals/library/i18n';

(function(d) {
    let Harlan = require("./internals/controller");
    let harlan = new Harlan();
    d.harlan = harlan; /* global */

    harlan.i18n = new I18n(localStorage.language ||
        navigator.language ||
        navigator.userLanguage || 'pt', this);

    harlan.interface = {
        helpers : {
            activeWindow : require("./internals/interface/active-window")
        }
    };

    /* Modules */
    require('./internals/modules/modal')(harlan);
    require('./internals/modules/form')(harlan);
    require('./internals/modules/alert')(harlan);
    require('./internals/modules/bipbop')(harlan);
    require('./internals/modules/cordova')(harlan);
    require('./internals/modules/blockui')(harlan);
    require('./internals/modules/remote-debug')(harlan);

    /**
    * From day to night and night to day
    * An endless sea of choice
    * If you should ever lose your way
    * Just listen to your voice
    */

    harlan.run();
})(window);
