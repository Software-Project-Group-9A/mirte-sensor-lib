const assert = require('assert');
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
        new ButtonPublisher(new ROSLIB.Topic(), undefined);
      },
      expectInvalidCamera,
      );
    });

    it('should return its topic', function() {
      const sensorInstance = new CameraPublisher('testTopic');

      assert.equal(sensorInstance.topic, 'testTopic');
    });
  });
});
