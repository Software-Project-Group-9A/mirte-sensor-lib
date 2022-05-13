require('../../globalSetup.js');

const ImageSubscriber = require('../../../src/actuators/ImageSubscriber');

const {document} = global.window;
const {createCanvas} = require('canvas');

/**
 * Image data and format of 5 by 5 png, with all of it's pixels red
 */
const RED_SQUARE_FORMAT = 'png';
const RED_SQUARE_DATA = 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAAXNSR0IArs4c' +
    '6QAAABNJREFUGFdj/M/A8J8BDTDSQBAAXGUJ/ETDsUAAAAAASUVORK5CYII=';

describe('ImageSubscriber', function() {
  describe('#constructor(topic, canvas)', function() {
    it('should not accept an undefined canvas argument', function() {
      assert.throws(
          () => {
            new ImageSubscriber(new ROSLIB.Topic(), undefined);
          },
          TypeError,
      );
    });
    it('should accept an HTMLCanvasElement as canvas argument', function() {
      const canvas = document.createElement('canvas');
      const topic = new ROSLIB.Topic();
      const subscriber = new ImageSubscriber(topic, canvas);

      assert.equal(subscriber.canvas, canvas);
      assert.equal(subscriber.topic, topic);
    });
    it('should correctly set its topic\'s messageType when compressed images are used', function() {
      const canvas = document.createElement('canvas');
      const subscriber = new ImageSubscriber(new ROSLIB.Topic(), canvas, true);

      assert.equal(subscriber.topic.messageType, 'sensor_msgs/CompressedImage');
    });
    it('should correctly set its topic\'s messageType when uncompressed images are used', function() {
      const canvas = document.createElement('canvas');
      const subscriber = new ImageSubscriber(new ROSLIB.Topic(), canvas, false);

      assert.equal(subscriber.topic.messageType, 'sensor_msgs/Image');
    });
  });
  describe('#createImageDataUrl(format, data)', function() {
    it('should create the correct dataURL for a given format and data array', function() {
      const format = 'jpeg';
      const data = 'BASE64ENCODINGOFIMAGEDATA';

      const dataURL = ImageSubscriber.createImageDataUrl(format, data);

      const expectedURL = 'data:image/jpeg;base64,BASE64ENCODINGOFIMAGEDATA';
      assert.equal(expectedURL, dataURL);
    });
  });
  describe('#onMessage(msg)', function() {
    it('should be able to draw a compressed image', function() {
      const message = {
        format: RED_SQUARE_FORMAT,
        data: RED_SQUARE_DATA,
      };
      const canvas = document.createElement('canvas');
      canvas.width = 5;
      canvas.heigh = 5;
      canvas._canvas = createCanvas(5, 5);
      const subscriber = new ImageSubscriber(new ROSLIB.Topic(), canvas, false);

      subscriber.onMessage(message);

      const ctx = canvas.getContext('2d');
      //

      const imageData = ctx.createImageData(canvas.width, canvas.height);

      //for (let pixel = 0; pixel < canvas.width * canvas.height; ) {
      const pixel = 0;  
      assert.equal(imageData.data[pixel * 4 + 0], 255);
        assert.equal(imageData.data[pixel * 4 + 1], 0);
        assert.equal(imageData.data[pixel * 4 + 2], 0);
        assert.equal(imageData.data[pixel * 4 + 3], 0);
      //}
    });
  });
});
