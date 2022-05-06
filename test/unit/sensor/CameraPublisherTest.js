const assert = require('assert');

// Sinon library for mocking
// Allows for fake timers, which might be useful in future testing
const sinon = require('sinon');

// JSDOM for simulating browser environment
const {JSDOM} = require('jsdom');
const {window} = new JSDOM(``, {});

// Module to test
const CameraPublisher = require('../../../src/sensors/CameraPublisher.js');

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
      assert(error.message === 'camera argument was not of type ' +
                                 'HTMLButtonElement');

      return true;
    }
    /* test for button verification */
    it('should reject an undefined camera', function() {
      assert.throws( () => {
        new CameraPublisher(new ROSLIB.Topic(), hz, undefined);
      },
      expectInvalidCamera,
      );
    });

    it('should return its topic', function() {
      const sensorInstance = new CameraPublisher('testTopic');

      assert.equal(sensorInstance.topic, 'testTopic');
    });
  });

  describe('#start()', function() {
    it('should subscribe onMouseUp and onMouseDown callbacks to correct events',
        function() {
          const camera = sinon.spy(document.createElement('button'));
          const topic = new ROSLIB.Topic();
          const publisher = new ButtonPublisher(topic, camera);

          publisher.start();

          assert.equal(camera.addEventListener.callCount, 2);
          assert(camera.addEventListener.calledWith('mouseup',
              publisher.onMouseUp));
          assert(camera.addEventListener.calledWith('mousedown',
              publisher.onMouseDown));

          window.AbortController;
        });
  });
});
