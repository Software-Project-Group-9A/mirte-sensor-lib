require('../../globalSetup.js');

// Module to test
const FlashLightSubscriber = require('../../../src/actuators/FlashLightSubscriber.js');

describe('Test FlashLightSubscriber', function() {
  describe('#constructor(topic)', function() {
    /**
     * Helper functions for checking whether correct error is raised for
     * invalid HTMLElements.
     * @param {Error} error The raised error.
     * @return {boolean} true if valid.
     */
    function expectUnsuportedBrowser(error) {
      assert(
          error.message === 'Browser does not support this feature'
      );

      return true;
    }

    /**
     * Helper functions for checking whether correct error is raised for
     * invalid HTMLElements.
     * @param {Error} error The raised error.
     * @return {boolean} true if valid.
     */
    function expectNoCameraAvailable(error) {
      assert(
          error.message === 'No camera found on this device'
      );

      return true;
    }

    it('should accept a ROSLIB.Topic', function() {
      const device = {
        deviceId: 'default',
        kind: 'videoinput',
        label: '',
        groupId: 'default',
      };

      global.navigator = {
        mediaDevices: {
          enumerateDevices: function() {
            return Promise.resolve(device);
          },
          getUserMedia: function() {
            return {
              deviceId: 'default',
              facingMode: ['user', 'environment'],
              height: {ideal: 1080},
              width: {ideal: 1920},
            };
          },
        },
      };

      assert.doesNotThrow(
          () => {
            subscriber = new FlashLightSubscriber(new ROSLIB.Topic());
          },
          (error) => {
            return false;
          }
      );
    });

    it('should throw an error if browser does not support', function() {
      global.navigator = {

      };

      assert.throws(() => {
        new FlashLightSubscriber(new ROSLIB.Topic());
      }, expectUnsuportedBrowser);
    });

    it('should throw an error if there is no camera', function() {
      const device = {
        deviceId: 'default',
        kind: 'audioinput',
        label: '',
        groupId: 'default',
      };

      global.navigator = {
        mediaDevices: {
          enumerateDevices: function() {
            return Promise.resolve([device]);
          },
          getUserMedia: function() {
            return {
              deviceId: 'default',
              facingMode: ['user', 'environment'],
              height: {ideal: 1080},
              width: {ideal: 1920},
            };
          },
        },
      };

      assert.throws(() => {
        new FlashLightSubscriber(new ROSLIB.Topic());
      }, expectNoCameraAvailable);
    });
  });
});
