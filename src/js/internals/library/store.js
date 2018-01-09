export default function (controller) {

    const elements = {};

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
    this.get = key => elements[key];

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