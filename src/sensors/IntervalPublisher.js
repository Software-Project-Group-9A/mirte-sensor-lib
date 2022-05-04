// Assumptions:
// A non-set timer is no problem.

const SensorPublisher = require('./SensorPublisher');

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
     * @param {Topic} topic a Topic from RosLibJS on which to publish.
     * @param {Int32} hz a standard frequency for this type of object.
     */
  constructor(topic, hz = 10) {
    super(topic);
    this.freq = hz;
  }

  /**
     * Captures sensor-data at current timeframe and
     * publishes this to the topic instantly.
     */
  createSnapshot() {
    throw Error('create snapshot is yet to be implemented!');
  }

  /**
     * Start the publishing of data to ROS with frequency of <freq> Hz.
     */
  start() {
    const delay = 1000/this.freq;
    const snapshotCallback = this.createSnapshot.bind(this);
    this.timer = setInterval(snapshotCallback, delay);
  }

  /**
     * Stops the publishing of data to ROS.
     */
  stop() {
    clearInterval(this.timer);
  }

  /**
  * Sets the maximum frequency at which new data can be published.
  * @param {Int32} hz frequency to be used.
  */
  setPublishFrequency(hz) {
    this.freq = hz;
    // Restart timer with new frequency
    this.stop();
    this.start();
  }
}

module.exports = IntervalPublisher;
