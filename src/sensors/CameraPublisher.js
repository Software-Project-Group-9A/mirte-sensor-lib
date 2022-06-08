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
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
     * @param {ROSLIB.Topic} topicName a Topic from RosLibJS
     * @param {HTMLVideoElement} camera the video element of which to publish the data from.
     * @param {HTMLCanvasElement} canvas a canvas element for making publishing video data possible
     * @param {Number} hz a standard frequency for this type of object.
     */
  constructor(ros, topicName, camera, canvas, hz = 10) {
    super(ros, topicName, hz);

    if (!(camera instanceof window.HTMLVideoElement)) {
      throw new TypeError('camera argument was not of type HTMLVideoElement');
    }
    if (!(canvas instanceof window.HTMLCanvasElement)) {
      throw new TypeError('canvas argument was not of type HTMLCanvasElement');
    }
    this.camera = camera;
    this.canvas = canvas;

    this.topic.messageType = 'sensor_msgs/CompressedImage';
  }

  /**
     * Create a snapshot of the current videostream.
     */
  createSnapshot() {
    // Creates a snapshot of the current videostream
    this.canvas.getContext('2d').drawImage(this.camera, 0, 0, this.canvas.width, this.canvas.height);

    // Converts the data to publishable data to ROS
    const data = this.canvas.toDataURL('image/jpeg');
    // Note: This message should publish to '/{name}/compressed', since the message contains compressed data
    const imageMessage = new ROSLIB.Message({
      format: 'jpeg',
      data: data.replace('data:image/jpeg;base64,', ''),
    });

    this.msg = imageMessage;
    super.createSnapshot();
  }

  /**
     * Start the publishing of camera data to ROS.
     *
     * @throws {Error} if no video source is available.
     */
  start() {
    // If there is no videostream available yet, do not publish data.
    if (!this.camera.srcObject) {
      throw new Error('No video source found.');
    }
    super.start();
  }
}


module.exports = CameraPublisher;
