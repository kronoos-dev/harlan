import ChartJS from 'chart.js';

module.exports = {
    radialProject : require('./radial-project'),
    chart(...args) {
        return new ChartJS(...args);
    }
};

require('./jquery/magic-label');
