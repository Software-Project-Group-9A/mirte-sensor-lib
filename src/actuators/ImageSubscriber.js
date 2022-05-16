const Subscriber = require('./Subscriber');

/**
 *
 */
class ImageSubscriber extends Subscriber {
  /**
    * Creates a new ImageSubscriber, that will display the images published to the provided topic.
    * Both compressed (sensor_msgs/CompressedImage) and non-compressed images (sensor_msgs/Image)
    * to the provided topic on the provided canvas.
    * @param {ROSLIB.Topic} topic topic from which to subscribe to
    * @param {HTMLCanvasElement} canvas canvas to draw published images on
    * @param {boolean} compressed  whether compressed images are published to the topic. True by defeault.
    */
  constructor(topic, canvas, compressed = true) {
    super(topic);

    if (!(canvas instanceof window.HTMLCanvasElement)) {
      throw new TypeError('canvas argument must be of type HTMLCanvasElement');
    }

    this.canvas = canvas;
    this.compressed = compressed;

    this.topic.messageType = this.getMessageType();
  }

  /**
   * Returns the messageType this subscriber expects to receieve.
   * @return {string} ROS messageType this subscriber expects to recieve
   */
  getMessageType() {
    return this.compressed ? 'sensor_msgs/CompressedImage' : 'sensor_msgs/Image';
  }

  /**
   * Creates a data URL encoding an image in the given format with the given image data.
   * @param {String} format format of the image (e.g. png, jpeg, etc)
   * @param {String} data data of the image, in base64 format
   * @return {String} data URL conaining image data
   */
  static createImageDataUrl(format, data) {
    return 'data:image/' + format + ';base64,' + data;
  }

  /**
   *
   * @param {*} src
   * @param {*} ctx
   */
  drawImage(src) {
    // draw image to canvas
    const canvas = this.canvas;
    const ctx = canvas.getContext('2d');
    const image = new window.Image();

    image.onload = function() {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };

    image.onerror = function() {
      throw Error('could not draw image');
    };

    image.src = src;
  }

  /**
   * Callback for handling incomming published message.
   * @param {ROSLIB.Message} msg message of type sensor_msgs/Image or sensor_msgs/CompressedImage,
   * depending on whether this subscribed is using compressed images.
   */
  onMessage(msg) {
    const data = msg.data;
    let imageDataUrl;

    if (this.compressed) {
      imageDataUrl = ImageSubscriber.createImageDataUrl(msg.format, data);
    } else {
      // setup canvas
      const imageCanvas = document.createElement('canvas');
      imageCanvas.width = msg.width;
      imageCanvas.height = msg.height;
      const ctx = imageCanvas.getContext('2d');

      // create RGBA image data from raw pixel data in msg
      const imageData = ctx.createImageData(msg.width, msg.height);
      imageData.data = convertImageData(msg.data, msg.encoding);
      image.canvas.putImageData(imageData);

      // create new dataURL from canvas contents
      imageDataUrl = imageCanvas.toDataURL();
    }

    // draw image contained in dataURL to canvas
    this.drawImage(imageDataUrl);
  }
}

module.exports = ImageSubscriber;
