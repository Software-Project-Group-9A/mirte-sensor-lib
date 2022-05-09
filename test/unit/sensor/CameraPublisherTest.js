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

/**
 * Helper method to create a standard CameraPublisher.
 * @return {CameraPublisher} a new CameraPublisher that is
 * initialised with a basic video.
 */
function createStandardCamera() {
  const topic = new ROSLIB.Topic(new ROSLIB.Topic());
  // Setup CameraPublisher object
  const video = document.createElement('video');
  const camera = new CameraPublisher(topic, video);
  return camera;
}

describe('Test CamerPublisher', function() {
  describe('#constructor(topic, camera)', function() {
    /**
     * Helper functions for checking whether correct error is raised for
     * invalid buttons.
     * @param {Error} error The raised error.
     * @return {boolean} true if valid.
     */
    function expectInvalidCamera(error) {
      assert(error instanceof TypeError);
      assert(error.message === 'camera argument was not of type '+
      'HTMLVideoElement');
      return true;
    }

    /**
     * Helper functions for checking whether correct error is raised for
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
      // let camera;
      const videoElem = document.createElement('video');
      // assert(videoElem instanceof window.HTMLVideoElement);
      const camera2 = createStandardCamera();
      assert.doesNotThrow(
          () => {
            camera = new CameraPublisher(new ROSLIB.Topic(), videoElem);
          },
          (error) => {
            return false;
          },
      );
      console.log('IS'+camera);
      console.log('IS'+camera2);
    });
  });

  describe('#start()', function() {
    it('should call to createsnapshot once',
        function() {
          const camera = sinon.spy(document.createElement('video'));
          // const std = createStandardCamera();
          // window.document = dom.window.document;

          // const canvas = document.createElement('canvas');
          document.createElement('canvas');
          const publisher = sinon.stub(new CameraPublisher(new ROSLIB.Topic(),
              camera));

          // console.log("type = "+typeof(camera));
          publisher.start();

          assert.equal(camera.addEventListener.callCount, 0);
        });
  });
});
