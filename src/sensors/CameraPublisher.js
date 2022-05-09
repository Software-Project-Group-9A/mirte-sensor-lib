const IntervalPublisher = require('./IntervalPublisher');

// most template code from http://wiki.ros.org/roslibjs/Tutorials/Publishing%20video%20and%20IMU%20data%20with%20roslibjs
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
  constructor(topic, camera, hz = 100) {
    super(topic, hz);

    if (!(camera instanceof window.HTMLVideoElement)) {
      throw new TypeError('camera argument was not of type HTMLVideoElement');
    }
    this.camera = camera;
    this.canvas = null;
    this.cameraTimer = null;
  }

  /**
   * Error fucntion
   * @param {*} _event error type
   */
  onError(_event) {
    throw new Error(_event);
  }
  /**
     * Callback for reading cameras.
     * @param {*} _event object containing sensor data.
     */
  onReadData(_event) {
    const self = this;
    this.camera.addEventListener('loadedmetadata', function(e) {
      console.log('width = '+self.videoWidth);
      self.canvas.width = self.video.videoWidth;
      self.canvas.height = self.video.videoHeight;
      console.log('so we get '+self.canvas.width);
    }).bind(this);
  }

  /**
     * Create a snapshot of the current videostream.
     *
     * Resource used: https://web.dev/requestvideoframecallback-rvfc/
     */
  createSnapshot() {
    this.canvas.getContext('2d')
        .drawImage(this.camera, 0, 0, this.camera.videoWidth,
            this.camera.videoHeight);

    const data = this.canvas.toDataURL('image/jpeg');
    const imageMessage = new ROSLIB.Message({
      format: 'jpeg',
      data: data.replace('data:image/jpeg;base64,', ''),
    });
    // console.log(imageMessage.data);
    this.topic.publish(imageMessage);
  }

  /**
     * Start the publishing of camera data to ROS.
     *
     * Resource used: http://wiki.ros.org/roslibjs/Tutorials/Publishing%20video%20and%20IMU%20data%20with%20roslibjs
     */
  start() {
    super.start();
    const self = this;
    if (document.querySelector('canvas')) {
      this.canvas = document.querySelector('canvas');
    } else {
      this.canvas = document.createElement('canvas');
    }

    this.camera.addEventListener('loadedmetadata', function(e) {
      self.canvas.width = self.camera.videoWidth;
      self.canvas.height = self.camera.videoHeight;
    });


    const delay = 1000/this.freq;
    this.cameraTimer = setInterval(this.createSnapshot, delay);
  }

  /**
   * Stops the publishing of data to ROS.
   */
  stop() {
    super.stop();
  }
}


module.exports = CameraPublisher;
