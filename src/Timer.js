class Timer {
    _timerHandler;
    _time;
    _fn;

    /**
     * Creates a timer and will automatically execute the given function when the timer expires
     * @param {Number} time the time of the timer to start in milliseconds
     * @param {*} fn the function to call when the timer is finished
     */
    constructor(time, fn) {
        this._time = time;
        this._fn = fn;

        this._timerHandler = setTimeout(this._fn, this._time);
    }

    /**
     * Resets the timer to its initial time
     * @returns {Timer} this instance
     */
    reset = () => {
        clearTimeout(this._timerHandler);
        this._timerHandler = setTimeout(this._fn, this._time);
        return this;
    }

    get handler() { return this._timerHandler; }
    get time() { return this._time; }
    get function() { return this._fn; }
}

exports.default = Timer;
module.exports = Timer;