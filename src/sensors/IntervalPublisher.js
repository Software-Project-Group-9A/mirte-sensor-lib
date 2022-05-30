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
     * @param {ROSLIB.Ros} ros a ROS instance to publish to
     * @param {ROSLIB.Topic} topicname a Topic from RosLibJS on which to publish.
     * @param {Number} hz a standard frequency for this type of object.
     */
  constructor(ros, topicname, hz = 10) {
    super(ros, topicname);

    if (hz <= 0) {
      throw new Error('Cannot construct with frequency ' + hz);
    } else {
      this.freq = hz;
    }
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
    super.start();
    const delay = 1000/this.freq;
    const snapshotCallback = this.createSnapshot.bind(this);
    this.timer = setInterval(snapshotCallback, delay);
  }

  /**
     * Stops the publishing of data to ROS.
     */
  stop() {
    super.stop();
    clearInterval(this.timer);
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
