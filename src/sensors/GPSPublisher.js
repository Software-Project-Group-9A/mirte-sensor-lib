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
   * Creates a new GPSPublisher, which will publish the longitude and latitude
   * of the current device in the form of a sensor_msgs/NavSatFix message.
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
   * @param {ROSLIB.Topic} topicName topic to which to publish geolocation data.
   * @param {number} hz frequency at which to publish GPS data, in Hertz.
   * If no frequency is specified, this will default to 1 Hz.
   * @throws {NotSupportedError} if the Geolocation API is not supported
   * by the current browser.
   */
  constructor(ros, topicName, hz = 1) {
    super(ros, topicName, hz);

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
    const coords1 = position1.coords;
    const coords2 = position2.coords;

    return coords1.latitude === coords2.latitude &&
           coords1.longitude === coords2.longitude;
  }

  /**
   * Start the publishing of data to ROS with frequency of <freq> Hz.
   */
  start() {
    super.start();

    // Callback for reading position data
    const successCallback = function(pos) {
      this.position = pos;
    }.bind(this);

    // Callback for handling errors. Will throw any error provided to it.
    const errorCallback = function(error) {
      throw error;
    };

    this.watchId = window.navigator.geolocation.watchPosition(
        successCallback,
        errorCallback);
  }

  /**
   * Stops the publishing of data to ROS.
   */
  stop() {
    super.stop();
    window.navigator.geolocation.clearWatch(this.watchId);
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
  static createNavSatMessage(coordinates) {
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

    // if position did not change since last publishing, do not publish
    if (this.lastPublishedPosition && GPSPublisher.isSamePosition(this.position, this.lastPublishedPosition)) {
      return;
    }

    // create and publish message
    const coordinates = this.position.coords;
    const message = GPSPublisher.createNavSatMessage(coordinates);
    this.topic.publish(message);
    this.lastPublishedPosition = this.position;
  }
}

module.exports = GPSPublisher;
