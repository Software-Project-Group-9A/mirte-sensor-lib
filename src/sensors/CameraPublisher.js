const IntervalPublisher = require('./IntervalPublisher');

/**
 * CameraPublisher publishes the frame of a video stream.
 * This state is published at a set interval,
 *
 * The data resulting from the button interactions is published as a
 * ROS sensor_msgs/Image Message message.
 */
class CameraPublisher extends IntervalPublisher {
  /**
     * Creates a new Camera publisher that publishes to the provided topic.
     * @param {ROSLIB.Topic} topic a Topic from RosLibJS
     * @param {HTMLVideoElement} camera camera of which to publish data from
     * @param {Int32} hz the frequency to publish the camera data
     */
  constructor(topic, camera, hz = 10) {
    super(topic, hz);

    if (!(camera instanceof window.HTMLVideoElement)) {
      throw new TypeError('camera argument was not of type HTMLVideoElement');
    }
    this.camera = camera;
    this.canvas = null;
  }

  /**
   * Error fucntion
   * @param {*} _event error type
   */
  onError(_event) {
    throw new Error(_event);
  }

  /**
     * Create a snapshot of the current videostream.
     */
  createSnapshot() {
    this.canvas.getContext('2d').drawImage(this.camera, 0, 0, this.canvas.videoWidth, this.canvas.videoHeight);

    const data = this.canvas.toDataURL('image/jpeg');
    const imageMessage = new ROSLIB.Message({
      format: 'jpeg',
      data: data.replace('data:image/jpeg;base64,', ''),
    });

    this.topic.publish(imageMessage);
  }

  /**
     * Start the publishing of camera data to ROS.
     *
     * @throws {ReferenceError} if no available video source.
     */
  start() {
    if (!this.camera.srcObject) {
      throw new ReferenceError('No video source found.');
    }
    if (window.document.querySelector('canvas')) {
      this.canvas = window.document.querySelector('canvas');
    } else {
      this.canvas = window.document.createElement('canvas');
      this.canvas.width = this.camera.videoWidth;
      this.canvas.height = this.camera.videoHeight;
    }

    super.start();
  }

  /**
   * Stops the publishing of data to ROS.
   */
  stop() {
    super.stop();
  }
}


module.exports = CameraPublisher;
