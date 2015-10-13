module.exports = function (controller) {

    var elements = {};

    /**
     * Store a value
     * @param key
     * @param value
     * @returns idx
     */
    this.set = function (key, value) {
        elements[key] = value;
        return this;
    };

    /**
     * 
     * @param {string} key
     * @returns mixed
     */
    this.get = function (key) {
        return elements[key];
    };

    /**
     * Recover a value
     * @param {int} idx
     * @returns mixed
     */
    this.unset = function (idx) {
        delete elements[idx];
        return this;
    };

    return this;
};