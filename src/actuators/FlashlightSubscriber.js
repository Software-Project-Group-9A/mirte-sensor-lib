const Subscriber = require('./Subscriber.js');
const NotSupportedError = require('../error/NotSupportedError');

/**
 * FlashlightSubscriber subscribes to a ROS topic and turns the flashlight on on command.
 * Used source: https://codepen.io/adamrifai/pen/YLxjKa
 *
 * The data should be from a topic with message type
 * ROS std_msgs/Bool message.
 */
class FlashlightSubscriber extends Subscriber {
  /**
   * Creates a new TextSubscriber.
   * @param {ROSLIB.Topic} topic topic to which to subscribe to
   */
  constructor(topic) {
    super(topic);

    // Test browser support
    const SUPPORTS_MEDIA_DEVICES = 'mediaDevices' in navigator;

    if (SUPPORTS_MEDIA_DEVICES) {
      // Get the environment camera (usually the second one)
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const cameras = devices.filter((device) => device.kind === 'videoinput');

        if (cameras.length === 0) {
          throw Error('No camera found on this device');
        }

        const camera = cameras[cameras.length - 1];
        navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: camera.deviceId,
            facingMode: ['user', 'environment'],
            height: {ideal: 1080},
            width: {ideal: 1920},
          },
        }).then((stream) => {
          this.track = stream.getVideoTracks()[0];

          // Create image capture object and get camera capabilities
          this.imageCapture = new ImageCapture(this.track);
        });
      });
    } else {
      throw new NotSupportedError('Browser does not support this feature');
    }
  }

  /**
   * Callback that gets called when a message is received.
   * Displays received message in HTML.
   * @param {ROSLIB.Message} msg the received message
   */
  onMessage(msg) {
    // Create stream and get video track
    this.imageCapture.getPhotoCapabilities().then(() => {
      // turn torch on or off depending on msg
      this.track.applyConstraints({
        advanced: [{torch: msg.data}],
      });
    });

    // The light will be on as long the track exists
  }
}

module.exports = FlashlightSubscriber;