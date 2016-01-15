var ChartJS = require("chart.js");

module.exports = {
      radialProject : require("./radial-project"),
      chart: function () {
          return new ChartJS.apply(this, Array.from(arguments));
      }
};

require("./jquery/magic-label");