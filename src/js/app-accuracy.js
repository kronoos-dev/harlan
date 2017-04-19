import 'babel-polyfill';
import 'es6-shim';
import 'dom4';

import I18n from './internals/library/i18n';

(function(d) {
    var Harlan = require("./internals/controller");
    d.harlan = new Harlan();

    d.harlan.i18n = new I18n(localStorage.language ||
        navigator.language ||
        navigator.userLanguage || 'pt', this);
    d.harlan.interface = {
        helpers : {
            activeWindow : require("./internals/interface/active-window")
        }
    };

    /* Modules */
    require('./internals/modules/modal')(d.harlan);
    require('./internals/modules/form')(d.harlan);
    require('./internals/modules/alert')(d.harlan);
    require('./internals/modules/bipbop')(d.harlan);
    require('./internals/modules/cordova')(d.harlan);
    require('./internals/modules/blockui')(d.harlan);

    /**
    * From day to night and night to day
    * An endless sea of choice
    * If you should ever lose your way
    * Just listen to your voice
    */

    d.harlan.run();
})(window);
