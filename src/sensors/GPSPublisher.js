const IntervalPublisher = require('./IntervalPublisher');
const NotSupportedError = require('../error/NotSupportedError');

/**
 * GPSPublisher publishes the geolocation data of the
 * current device.
 *
 * The user must make sure to give permission for access
 * to their geolocation.
 */
class GPSPublisher extends IntervalPublisher {
  /**
   * Id of geolocation watch callback
   */
  #watchId;

  /**
   * GeolocationPosition storing latest device position
   */
  #position;

  /**
   * Creates a new GPSPublisher.
   * @param {ROSLIB.Topic} topic topic to which to publish geolocation data.
   * @param {number} hz frequency at which to publish GPS data, in Hertz.
   * @throws {NotSupportedError} if the Geolocation API is not supported
   * by the current browser.
   */
  constructor(topic, hz) {
    super(topic, hz);
    this.topic.messageType = GPSPublisher.messageType;

    // check support for API
    if (!window.navigator.geolocation) {
      throw new NotSupportedError('Unable to create GPSPublisher, ' +
        'Geolocation API not supported');
    }
  }

  /**
   * Returns the message type this publisher publishes its data.
   */
  static get messageType() {
    return 'sensor_msgs/NavSatFix';
  }

  /**
   * Callback for reading position data
   * @param {Geolocation.GeolocationPosition} pos latest geolocation position of device
   */
  onSucces(pos) {
    this.#position = pos;
  }

  /**
   * Start the publishing of data to ROS with frequency of <freq> Hz.
   */
  start() {
    super.start();

    const successCallback = this.onSucces.bind(this);
    const errorCallback = this.onError.bind(this);

    this.#watchId = window.navigator.geolocation.watchPosition(
        successCallback,
        errorCallback);
  }

  /**
   *
   */
  stop() {
    super.stop();

    window.navigator.geolocation.clearWatch(this.#watchId);
  }

  /**
   * TODO: reach concencus on error handling
   * we might want user specified callbacks, as errors can occur in callbacks
   * of the publisher itself, where they cannot be handled by the user.
   *
   * It would probably be useful to translate all the API specific errors,
   * to some standard error type, like NotSupportedError,
   * PermissionDeniedError, etc
   * @param {*} error
   */
  onError(error) {
    throw error;
  }

  /**
   * Creates a new ROS.Message object, containing a
   * sensor_msgs/NavSatFix message.
   *
   * Only the longitude and latitude are contained in this
   * message.
   * @param {GeolocationCoordinates} coordinates coordinates to be
   * contained by the created message.
   * @return {ROSLIB.Message} sensor_msgs/NavSatFix message containing longitude
   * and latitude of supplied coordinates.
   */
  createNavSatMessage(coordinates) {
    return new ROSLIB.Message({
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      position_covariance_type: 0,
    });
  }

  /**
   *
   */
  createSnapshot() {
    // position has not yet been set, do not publish
    if (!this.#position) {
      return;
    }

    // create and publish message
    const coordinates = this.#position.coords;
    const message = this.createNavSatMessage(coordinates);
    this.topic.publish(message);
  }
}

module.exports = GPSPublisher;
