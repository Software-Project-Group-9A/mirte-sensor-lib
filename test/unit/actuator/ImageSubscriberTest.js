require('../../globalSetup.js');

const ImageSubscriber = require('../../../src/actuators/ImageSubscriber');
const NotSupportedError = require('../../../src/error/NotSupportedError');

const {document} = global.window;
global.document = document;
const {ImageData} = require('canvas');
global.window.ImageData = ImageData;

/**
 * Image data and format of 5 by 5 png, with all of it's pixels red
 */
const RED_SQUARE_FORMAT = 'png';
const RED_SQUARE_DATA = 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAAXNSR0IArs4c' +
    '6QAAABNJREFUGFdj/M/A8J8BDTDSQBAAXGUJ/ETDsUAAAAAASUVORK5CYII=';
/**
 * Pixel data of red square in rgb8 format, with correspong png encoding data
 */
const RED_SQUARE_RGB = '/wAA/wAA/wAA/wAA/wAA/wAA/wAA/wAA/wAA/wAA/wAA' +
              '/wAA/wAA/wAA/wAA/wAA/wAA/wAA/wAA/wAA/wAA/wAA/wAA/wAA/wAA';
const RED_SQUARE_RGB_DATA = 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAAC' +
              'NbyblAAAABmJLR0QA/wD/AP+gvaeTAAAAFUlEQVQImWP8z8DwnwEN' +
              'MKELUEEQAM6pAggfw96NAAAAAElFTkSuQmCC';

describe('ImageSubscriber', function() {
  describe('#constructor(ros, topicName, canvas)', function() {
    it('should not accept an undefined canvas argument', function() {
      assert.throws(
          () => {
            new ImageSubscriber(new ROSLIB.Ros(), 'topic', undefined);
          },
          TypeError
      );
    });
    it('should accept an HTMLCanvasElement as canvas argument', function() {
      const canvas = document.createElement('canvas');
      const ros = new ROSLIB.Ros();
      const subscriber = new ImageSubscriber(ros, 'topic', canvas);

      assert.equal(subscriber.canvas, canvas);
      assert.equal(subscriber.ros, ros);
      assert.equal(subscriber.topic.name, 'topic');
    });
    it('should correctly set its topic\'s messageType when compressed images are used', function() {
      const canvas = document.createElement('canvas');
      const subscriber = new ImageSubscriber(new ROSLIB.Ros(), 'topic', canvas, true);

      assert.equal(subscriber.topic.messageType, 'sensor_msgs/CompressedImage');
    });
    it('should correctly set its topic\'s messageType when uncompressed images are used', function() {
      const canvas = document.createElement('canvas');
      const subscriber = new ImageSubscriber(new ROSLIB.Ros(), 'topic', canvas, false);

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
    it('calls drawImage with correct URL for compressed image', function() {
      const canvas = document.createElement('canvas', {width: 5, height: 5});
      const subscriber = new ImageSubscriber(new ROSLIB.Ros(), 'topic', canvas, true);

      subscriber.drawImage = sinon.spy(function(src) {
        const canvas = this.canvas;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(255, 0, 0, 255)';
        ctx.fillRect(0, 0, 5, 5);
      });

      subscriber.onMessage({format: RED_SQUARE_FORMAT, data: RED_SQUARE_DATA});

      const expectedURL = `data:image/${RED_SQUARE_FORMAT};base64,${RED_SQUARE_DATA}`;
      assert.equal(subscriber.drawImage.callCount, 1);
      assert.equal(subscriber.drawImage.firstCall.firstArg, expectedURL);
    });
    it('calls drawImage with correct URL for uncompressed image in rgb8 encoding', function() {
      const canvas = document.createElement('canvas', {width: 2, height: 2});
      const subscriber = new ImageSubscriber(new ROSLIB.Ros(), 'topic', canvas, false);

      subscriber.drawImage = sinon.spy(function(src) {
        const canvas = this.canvas;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(255, 0, 0, 255)';
        ctx.fillRect(0, 0, 5, 5);
      });

      subscriber.onMessage({encoding: 'rgb8', data: RED_SQUARE_RGB, width: 5, height: 5});

      const expectedURL = `data:image/${RED_SQUARE_FORMAT};base64,${RED_SQUARE_RGB_DATA}`;
      assert.equal(subscriber.drawImage.callCount, 1);
      assert.equal(subscriber.drawImage.firstCall.firstArg, expectedURL);
    });
  });
  describe('#convertImageData(pixelData, encoding, pixels)', function() {
    it('throw an error for unsupported encodings', function() {
      const pixelData = 'FFFFFFFFFFFFFFFF';
      const format = 'grb8';
      const pixels = 4;

      assert.throws(() => {
        ImageSubscriber.convertImageData(pixelData, format, pixels);
      },
      NotSupportedError);
    });
    it('should correctly convert single rgb8 encoded pixel', function() {
      // rgb(255, 0, 0)
      const pixelData = '/wAA';
      const format = 'rgb8';
      const pixels = 1;

      const imageData = ImageSubscriber.convertImageData(pixelData, format, pixels);

      assert.equal(imageData.length, 4);
      assert.equal(imageData[0], 255);
      assert.equal(imageData[1], 0);
      assert.equal(imageData[2], 0);
      assert.equal(imageData[3], 255);
    });
    it('should correctly convert single rgba8 encoded pixel', function() {
      // rgba(255, 0, 0, 5)
      const pixelData = '/wAABQ==';
      const format = 'rgba8';
      const pixels = 1;

      const imageData = ImageSubscriber.convertImageData(pixelData, format, pixels);

      assert.equal(imageData.length, 4);
      assert.equal(imageData[0], 255);
      assert.equal(imageData[1], 0);
      assert.equal(imageData[2], 0);
      assert.equal(imageData[3], 5);
    });
    it('should correctly convert multiple rgb8 encoded pixels', function() {
      // red, green, blue and white pixel
      const pixelData = '/wAAAP8AAAD/AAAA';
      const format = 'rgb8';
      const pixels = 4;

      const imageData = ImageSubscriber.convertImageData(pixelData, format, pixels);

      assert.equal(imageData.length, 16);
      const expectedPixelData = Uint8ClampedArray.from([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 0, 0, 0, 255]);
      assert.deepEqual(imageData, expectedPixelData);
    });
    it('should correctly convert multiple rgba8 encoded pixels', function() {
      // red, green, blue and white pixel, with alpha of 255
      const pixelData = '/wAA/wD/AP8AAP//AAAA/w==';
      const format = 'rgba8';
      const pixels = 4;

      const imageData = ImageSubscriber.convertImageData(pixelData, format, pixels);

      assert.equal(imageData.length, 16);
      const expectedPixelData = Uint8ClampedArray.from([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 0, 0, 0, 255]);
      assert.deepEqual(imageData, expectedPixelData);
    });
  });
  describe('#readFromConfig(ros, config, targetElement)', function() {
    it('should return the correct subscriber instance', function() {
      const targetElement = document.createElement('div');

      const config = {
        'name': 'imageA',
        'topicPath': '/mirte/phone_image_output',
        'x': 20,
        'y': 20,
      };

      const subscriber = ImageSubscriber.readFromConfig(new ROSLIB.Ros(), config, targetElement);

      assert.equal(subscriber.topic.name, '/mirte/phone_image_output/imageA');
      assert.equal(targetElement.childElementCount, 1);
      const child = targetElement.firstChild;
      assert(child instanceof window.HTMLCanvasElement);
    });
  });
});
