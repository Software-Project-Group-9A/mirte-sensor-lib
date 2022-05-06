const IntervalPublisher = require('./IntervalPublisher');
const UnsupportedBrowserError = require('  ../error/NotSupportedError');

class GPSPublisher extends IntervalPublisher {

    #hasStarted;
    #watchId;
    #position;

    constructor(topic) {
        super(topic);

        if (!navigation.geolocation) {
            throw new NotSupportedError('Unable to create GPSPublisher, Geolocation API not supported');
        }
    }

    get hasStarted() {
        return this.#hasStarted;
    }

    start() {
        if (this.hasStarted) {
            throw new EvalError("Publisher was already started");
        }
        this.#watchId = navigator.geolocation.watchPosition(this.onSuccess.bind(this), this.onError.bind(this)/*, options?*/);
        this.#hasStarted = true;
    }

    stop() {
        if (this.hasStarted) {
            throw new EvalError("Publisher was not yet started");
        }
        navigator.geolocation.clearWatch(this.#watchId);
        this.#hasStarted = false;
    }

    onSucces(pos) {
        this.#position = pos;
    }

    /* TODO: reach concencus on error handling
     * we might want user specified callbacks, as errors can occur in callbacks of 
     * the publisher itself, where they cannot be handled by the user.
     *  
     * It would probably be useful to translate all the API specific errors, 
     * to some standard error type, like NotSupportedError, PermissionDeniedError, etc
     */
    onError(error) {

    }

    createSnapshot() {
        // position has not yet been set, do not publish
        if (!this.#pos) {
            return;
        }

        // create message here
    }
}