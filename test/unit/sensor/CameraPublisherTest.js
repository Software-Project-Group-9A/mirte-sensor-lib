require('../../globalSetup.js');
const assert = require('assert');

const {document} = global.window;

// Module to test
const CameraPublisher = require('../../../src/sensors/CameraPublisher.js');

describe('Test CamerPublisher', function() {
  describe('#constructor(ros, topicName, camera, canvas, hz)', function() {
    /**
     * Helper function for checking whether correct error is raised for
     * invalid buttons.
     * @param {Error} error The raised error.
     * @return {boolean} true if valid.
     */
    function expectInvalidCamera(error) {
      assert(error instanceof TypeError);
      assert(error.message === 'camera argument was not of type HTMLVideoElement');
      return true;
    }
    /**
     * Helper function for checking whether correct error is raised for
     * invalid buttons.
     * @param {Error} error The raised error.
     * @return {boolean} true if valid.
     */
    function expectInvalidCanvas(error) {
      assert(error instanceof TypeError);
      assert(error.message === 'canvas argument was not of type HTMLCanvasElement');
      return true;
    }
    const canvas = document.createElement('canvas');
    const camera = document.createElement('video');

    /* test for camera verification */
    it('should reject an undefined camera', function() {
      assert.throws( () => {
        new CameraPublisher(new ROSLIB.Ros(), 'topic', undefined, canvas);
      },
      expectInvalidCamera);
    });
    /* test for correct camera verification */
    it('should reject an element other than camera', function() {
      assert.throws( () => {
        new CameraPublisher(new ROSLIB.Ros(), 'topic', document.createElement('button'), canvas);
      },
      expectInvalidCamera);
    });
    /* test for canvas verification */
    it('should reject an undefined canvas', function() {
      assert.throws( () => {
        new CameraPublisher(new ROSLIB.Ros(), 'topic', camera, undefined);
      },
      expectInvalidCanvas);
    });
    /* test for correct canvas verification */
    it('should reject an element other than canvas', function() {
      assert.throws( () => {
        new CameraPublisher(new ROSLIB.Ros(), 'topic', camera, document.createElement('button'));
      },
      expectInvalidCanvas);
    });
    it('should accept publisher with topic and camera', function() {
      const ros = new ROSLIB.Ros();
      const cameraPublisher = new CameraPublisher(ros, 'topic', camera, canvas);

      assert.equal(cameraPublisher.freq, 10);
      assert.equal(cameraPublisher.camera, camera);
      assert.equal(cameraPublisher.canvas, canvas);
    });
  });

  describe('#readFromConfig(ros, config)', function() {
    it('should return a started instance of CameraPublisher', function() {
      const cameraName = 'camera';
      const frequency = 8.0;
      const videoId = 'camA';
      const canvasId = 'canvasA';
      const ros = new ROSLIB.Ros();
      const config = {
        name: cameraName,
        frequency: frequency,
        cameraId: videoId,
        canvasId: canvasId,
      };

      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      video.id = videoId;
      canvas.id = canvasId;
      // stub for src object
      video.srcObject = {};
      document.documentElement.appendChild(video);
      document.documentElement.appendChild(canvas);

      const publisher = CameraPublisher.readFromConfig(ros, config);

      const topicName = 'mirte/phone_camera/' + cameraName;
      assert(publisher instanceof CameraPublisher);
      assert(publisher.started);
      assert.equal(publisher.topic.name, topicName);
      assert.equal(publisher.freq, frequency);
      assert.equal(publisher.camera, video);
    });
  });
});
