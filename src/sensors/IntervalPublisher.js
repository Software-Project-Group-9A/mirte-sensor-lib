// Assumptions:
// A non-set timer is no problem.

const SensorPublisher = require('./SensorPublisher');

const isEqual = require('lodash.isequal');

/**
 * Interface-like class that can be extended by sensors that need
 * their messages to be published at regular intervals.
 * Usage requires provision of standard frequency for class in constructor
 * and implementation of createSnapshot function.
 */
class IntervalPublisher extends SensorPublisher {
  /**
     * Creates a new sensor publisher that publishes to
     * the provided topic with a Regular interval.
     * @param {ROSLIB.Ros} ros a ROS instance to publish to
     * @param {String} topicName name for the topic from ROS on which to publish data to
     * @param {Number} hz a standard frequency for this type of object.
     */
  constructor(ros, topicName, hz = 10) {
    super(ros, topicName);

    if (hz <= 0) {
      throw new Error('Cannot construct with frequency: ' + hz);
    }

    this.freq = hz;

    this.msg = null;
    this.alReadyPublishedMsg = null;
  }

  /**
     * Start the publishing of data to ROS with frequency of <freq> Hz.
     */
  start() {
    const delay = 1000/this.freq;
    const snapshotCallback = this.createSnapshot.bind(this);
    this.timer = setInterval(snapshotCallback, delay);

    super.start();
  }

  /**
     * Stops the publishing of data to ROS.
     */
  stop() {
    super.stop();

    clearInterval(this.timer);
  }

  /**
     * Captures sensor-data at current timeframe and
     * publishes this to the topic instantly.
     */
  createSnapshot() {
    if (!this.msg) {
      throw Error('createSnapshot has not been implemented correctly');
    }
    if (isEqual(this.msg, this.alReadyPublishedMsg)) {
      return;
    }

    this.topic.publish(this.msg);

    this.alReadyPublishedMsg = this.msg;
  }

  /**
  * Sets the maximum frequency at which new data can be published.
  * @param {Number} hz frequency to be used.
  */
  setPublishFrequency(hz) {
    if (hz <= 0) {
      throw new Error('Publisher cannot publish on frequency ' + hz +
        ' Hz, frequency remained ' + this.freq);
    }

    this.freq = hz;
    // Restart timer with new frequency
    if (this.started) {
      this.stop();
      this.start();
    }
  }
}

module.exports = IntervalPublisher;
