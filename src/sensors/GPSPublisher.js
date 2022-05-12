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
   * Creates a new GPSPublisher.
   * @param {ROSLIB.Topic} topic topic to which to publish geolocation data.
   * @param {number} hz frequency at which to publish GPS data, in Hertz.
   * @throws {NotSupportedError} if the Geolocation API is not supported
   * by the current browser.
   */
  constructor(topic, hz) {
    super(topic, hz);
    this.topic.messageType = GPSPublisher.messageType;

    /**
     * Id of geolocation watch callback
     */
    this.watchId = -1;

    /**
     * GeolocationPosition storing latest device position.
     * Is set to null when the latest position was already published.
     */
    this.position = undefined;

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
   * Returns whether the two given geolocationPositions have the same longitude and latitude
   * @param {GeolocationPosition} position1 first position
   * @param {GeolocationPosition} position2 second position
   * @return {boolean} whether the longitudes and latitudes of the two positions match
   */
  static isSamePosition(position1, position2) {
    const coords1 = position1.coordinates;
    const coords2 = position2.coordinates;
    return coords1.latitude = coords2.latitude && coords1.longitude == coords2.longitude;
  }

  /**
   * Callback for reading position data
   * @param {Geolocation.GeolocationPosition} pos latest geolocation position of device
   */
  onSucces(pos) {
    this.position = pos;
  }

  /**
   * Start the publishing of data to ROS with frequency of <freq> Hz.
   */
  start() {
    super.start();

    const successCallback = this.onSucces.bind(this);
    const errorCallback = this.onError.bind(this);

    this.watchId = window.navigator.geolocation.watchPosition(
        successCallback,
        errorCallback);
  }

  /**
   *
   */
  stop() {
    super.stop();
    window.navigator.geolocation.clearWatch(this.watchId);
  }

  /**
   * Callback for watching Geolocation.
   * Will throw any error provided to it.
   * @param {Error} error error to throw.
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
   * Creates a snapshot of the current position of the device, and publishes
   * this data as a sensor_msgs/NavSatFix message.
   */
  createSnapshot() {
    // position has not yet been set, do not publish
    if (!this.position) {
      return;
    }

    const coordinates = this.position.coords;

    // if position did not change, do not publish
    if (this.lastPublishedPosition && GPSPublisher.isSamePosition(this.position, this.lastPublishedPosition)) {
      return;
    }

    // create and publish message
    const message = this.createNavSatMessage(coordinates);
    this.topic.publish(message);
    this.lastPublishedPosition = this.position;
  }
}

module.exports = GPSPublisher;
