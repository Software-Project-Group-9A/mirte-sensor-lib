const SensorPublisher = require('./SensorPublisher');

// most template code from http://wiki.ros.org/roslibjs/Tutorials/Publishing%20video%20and%20IMU%20data%20with%20roslibjs
/**
 * CameraPublisher publishes the frame of a video stream.
 * This state is published at a set interval,
 *
 * The data resulting from the button interactions is published as a
 * ROS sensor_msgs/Image Message message.
 */
class CameraPublisher extends SensorPublisher {
  /**
     * Creates a new Camera publisher that publishes to the provided topic.
     * @param {Topic} topic a Topic from RosLibJS
     * @param {HTMLVideoElement} video camera of which to publish data from
     */
  constructor(topic, video) {
    super(topic);

    if (!(video instanceof window.HTMLVideoElement)) {
      throw new TypeError('camera argument was not of type HTMLVideoElement');
    }
    this.video = video;
    this.frequency = 0;
    this.cameraTimer = null;
    this.stream = null;
  }

  /**
     * Callback for reading cameras.
     * @param {*} _event object containing sensor data.
     */
  onReadData(_event) {
    // this.cameras = this.cameras
    //     .filter((device) => device.kind === 'videoinput')
    //     .map((device) => device.toJSON);

  }

  /**
     * Create a snapshot of the current videostream.
     *
     * Resource used: https://web.dev/requestvideoframecallback-rvfc/
     */
  takepicture() {
    const width = 640;
    const height = this.video.videoHeight / (this.video.videoWidth/width);

    this.canvas.width = width;
    this.canvas.height = height;

    this.canvas.getContext('2d').drawImage(this.stream, 0, 0, width, height);

    const data = this.canvas.toDataURL('image/jpeg');
    const imageMessage = new ROSLIB.Message({
      format: 'jpeg',
      data: data.replace('data:image/jpeg;base64,', ''),
    });
    console.log(imageMessage);
    this.topic.publish(imageMessage);
  }

  /**
     * Start the publishing of data to ROS.
     *
     * Resource used: http://wiki.ros.org/roslibjs/Tutorials/Publishing%20video%20and%20IMU%20data%20with%20roslibjs
     */
  start() {
    const constraints = {
      video: {deviceId: this.camera.deviceId},
      audio: false,
    };
    navigator.getUserMedia(constraints).then((stream) => {
      this.stream = stream;
      window.stream = stream;
    });
    const delay = 1000/this.freq;
    this.cameraTimer = setInterval(this.takepicture().bind(this), delay);
  }

  /**
     * Stops the publishing of data to ROS.
     */
  stop() {
    this.stream = null;
    this.takepicture();
    this.topic.unsubscribe();
  }
}


module.exports = CameraPublisher;
