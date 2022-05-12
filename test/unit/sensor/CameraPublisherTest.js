const assert = require('assert');
// Sinon library for mocking
const sinon = require('sinon');

// JSDOM for simulating browser environment
const {JSDOM} = require('jsdom');
const {window} = new JSDOM(``, {});

// Module to test
const CameraPublisher = require('../../../src/sensors/CameraPublisher.js');

// define JSDOM window in global scope, if not already defined
global.window = global.window || window;
const {document} = global.window;

require('../../globalSetup.js');

describe('Test CamerPublisher', function() {
  describe('#constructor(topic, camera)', function() {
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
        new CameraPublisher(new ROSLIB.Topic(), undefined, canvas);
      },
      expectInvalidCamera,
      );
    });
    /* test for correct camera verification */
    it('should reject an element other than camera', function() {
      assert.throws( () => {
        new CameraPublisher(new ROSLIB.Topic(), document.createElement('button'), canvas);
      },
      expectInvalidCamera,
      );
    });
    /* test for canvas verification */
    it('should reject an undefined canvas', function() {
      assert.throws( () => {
        new CameraPublisher(new ROSLIB.Topic(), camera, undefined);
      },
      expectInvalidCanvas,
      );
    });
    /* test for correct canvas verification */
    it('should reject an element other than canvas', function() {
      assert.throws( () => {
        new CameraPublisher(new ROSLIB.Topic(), camera, document.createElement('button'));
      },
      expectInvalidCanvas,
      );
    });
    it('should accept publisher with topic and camera', function() {
      const topic = new ROSLIB.Topic(new ROSLIB.Topic());
      const cameraPublisher = new CameraPublisher(topic, camera, canvas);
      assert.equal(cameraPublisher.freq, 10);
      assert.equal(cameraPublisher.camera, camera);
      assert.equal(cameraPublisher.canvas, canvas);
    });
  });

  describe('#start()', function() {
    /**
     * Helper function for checking whether correct error is raised for
     * invalid buttons.
     * @param {Error} error The raised error.
     * @return {boolean} true if valid.
     */
    function expectInvalidSource(error) {
      assert(error.message === 'No video source found.');
      return true;
    }
    it('should throw an error if there is no video source', function() {
      const camera = document.createElement('video');
      const canvas = document.createElement('canvas');
      const topic = sinon.spy(new ROSLIB.Topic());
      const publisher = sinon.spy(new CameraPublisher(topic, camera, canvas));

      assert.throws(() => publisher.start(), expectInvalidSource);
    });
  });
});
