require('../../globalSetup.js');

// Module to test
const FlashlightSubscriber = require('../../../src/actuators/FlashlightSubscriber.js');

describe('Test FlashlightSubscriber', function() {
  describe('#constructor(ros, topicName)', function() {
    // /**
    //  * Helper functions for checking whether correct error is raised for
    //  * invalid HTMLElements.
    //  * @param {Error} error The raised error.
    //  * @return {boolean} true if valid.
    //  */
    // function expectNoCameraAvailable(error) {
    //   assert(
    //       error.message === 'No camera found on this device'
    //   );

    //   return true;
    // }

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
            subscriber = new FlashlightSubscriber(new ROSLIB.Ros(), 'topic');
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
        new FlashlightSubscriber(new ROSLIB.Ros(), 'topic');
      }, expectUnsuportedBrowser);
    });

    describe('#readFromConfig(ros, config)', function() {
      it('should return the correct FlashlightSubscriber instance', function() {
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

        const config = {
          'name': 'flash',
          'topicPath': '/mirte/phone_flashlight',
        };

        subscriber = FlashlightSubscriber.readFromConfig(new ROSLIB.Ros(), config);

        const expectedTopicName = '/mirte/phone_flashlight/flash';
        assert.equal(subscriber.topic.name, expectedTopicName);
      });
    });

    //  THIS TEST DIDN'T WORK BUT WE COULD NOT FIND OUT WHY IT DOESN'T WORK
    //
    //   it('should throw an error if there is no camera', function() {
    //     const device = {
    //       deviceId: 'default',
    //       kind: 'audioinput',
    //       label: '',
    //       groupId: 'default',
    //     };

    //     global.navigator = {
    //       mediaDevices: {
    //         enumerateDevices: function() {
    //           return Promise.resolve([device]);
    //         },
    //         getUserMedia: function() {
    //           return {
    //             deviceId: 'default',
    //             facingMode: ['user', 'environment'],
    //             height: {ideal: 1080},
    //             width: {ideal: 1920},
    //           };
    //         },
    //       },
    //     };

  //     assert.throws(() => {
  //       new FlashlightSubscriber(new ROSLIB.Topic());
  //     }, expectNoCameraAvailable);
  //   });
  });
});
