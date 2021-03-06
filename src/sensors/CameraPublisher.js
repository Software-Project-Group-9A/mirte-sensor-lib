const IntervalPublisher = require('./IntervalPublisher');

/**
 * CameraPublisher publishes the frame of a video stream.
 * This state is published at a set interval,
 *
 * The data resulting from the button interactions is published as a
 * ROS sensor_msgs/Image Message message.
 * @see Uses the following example:
 * {@link http://wiki.ros.org/roslibjs/Tutorials/Publishing%20video%20and%20IMU%20data%20with%20roslibjs}
 */
class CameraPublisher extends IntervalPublisher {
  /**
     * Creates a new Camera publisher that publishes to the provided topic.
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
     * @param {String} topicName name for the topic to publish data to
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

    this.topicName = topicName + '/compressed';
    this.topic.name = this.topicName;

    this.camera = camera;
    this.canvas = canvas;

    this.topic.messageType = 'sensor_msgs/CompressedImage';
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
   * Deserializes a CameraPublisher stored in a config object, and returns the resulting publisher instance.
   * The returned instance is already started.
   * @param {ROSLIB.Ros} ros ros instance to which to resulting publisher will publish
   * @param {Object} config object with the following keys:
   * @param {string} config.name - name of the publisher to create
   * @param {string} config.topicPath - path to location of topic of publisher.
   *  Publisher will publish to the topic topicPath/name
   * @param {number} config.frequency - frequency of the publisher to create
   * @param {string} [config.cameraId='camera'] - id of HTMLVideoElement with camera data
   * @param {string} [config.canvasId='canvas'] - id of HTMLCanvasElement to use creating images from video
   * @return {CameraPublisher} CameraPublisher described in the provided config parameter
   */
  static readFromConfig(ros, config) {
    config.cameraId = config.cameraId || 'camera';
    config.canvasId = config.canvasId || 'canvas';
    const camera = document.getElementById(config.cameraId);
    const canvas = document.getElementById(config.canvasId);

    const topicName = config.topicPath + '/' + config.name;
    const publisher = new CameraPublisher(ros, topicName, camera, canvas);
    publisher.start();
    publisher.setPublishFrequency(config.frequency);

    return publisher;
  }
}


module.exports = CameraPublisher;
