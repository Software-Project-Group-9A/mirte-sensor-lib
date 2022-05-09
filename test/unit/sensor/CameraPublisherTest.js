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

// define dummy ROSLIB in global scope
global.ROSLIB = {
  Topic: function() {
    this.publish = function(msg) {};
  },
  Message: function(msg) {
    this.msg = msg;
  },
};

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
     * invalid topics.
     * @param {Error} error The raised error.
     * @return {boolean} true if valid.
     */
    function expectInvalidTopic(error) {
      assert(error instanceof TypeError);
      assert(error.message === 'topic argument was not of type ROSLIB.Topic');

      return true;
    }

    /* test for topic verification */
    it('should reject an undefined topic', function() {
      assert.throws( () => {
        new CameraPublisher(undefined, document.createElement('video'));
      },
      expectInvalidTopic,
      );
    });

    /* test for camera verification */
    it('should reject an undefined camera', function() {
      assert.throws( () => {
        new CameraPublisher(new ROSLIB.Topic(), undefined);
      },
      expectInvalidCamera,
      );
    });
    /* test for correct camera verification */
    it('should reject an element other than camera', function() {
      assert.throws( () => {
        new CameraPublisher(new ROSLIB.Topic(),
            document.createElement('canvas'));
      },
      expectInvalidCamera,
      );
    });
    it('should accept publisher with topic and camera', function() {
      const topic = new ROSLIB.Topic(new ROSLIB.Topic());
      const video = document.createElement('video');
      const camera = new CameraPublisher(topic, video);
      assert.equal(camera.freq, 10);
      assert.equal(camera.camera, video);
      assert.equal(camera.canvas, null);
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
      assert(error instanceof ReferenceError);
      assert(error.message === 'No video source found.');
      return true;
    }
    it('should throw an error if there is no video source', function() {
      const camera = document.createElement('video');
      const topic = sinon.spy(new ROSLIB.Topic());
      const publisher = sinon.spy(new CameraPublisher(topic, camera));

      assert.throws(() => publisher.start(), expectInvalidSource);
    });
  });
});
