require('../../globalSetup.js');
// Module to test
const MagneticDeclinationPublisher =
    require('../../../src/sensors/MagneticDeclinationPublisher.js');

// define JSDOM window in global scope, if not already defined
describe('Test MagneticDeclinationPublisher', function() {
  describe('#constructor(topic)', function() {
    /**
     * helper functions for checking whether correct error is raised
     * @param {*} error
     * @return {bool}
     */
    function expectInvalidTopic(error) {
      assert(error instanceof TypeError);
      assert.equal(error.message,
          'topic argument was not of type ROSLIB.Topic');
      return true;
    }

    it('should reject an undefined topic', function() {
      assert.throws(
          () => {
            new MagneticDeclinationPublisher(undefined);
          },
          expectInvalidTopic
      );
    });
    it('should reject any topic argument ' +
        'that is not a ROSLIB.Topic instance', function() {
      assert.throws(
          () => {
            new MagneticDeclinationPublisher('not a topic');
          },
          expectInvalidTopic
      );
    });

    it('should accept a ROSLIB.Topic', function() {
      assert.doesNotThrow(
          () => {
            new MagneticDeclinationPublisher(new ROSLIB.Topic());
          },
          (error) => {
            return false;
          }
      );
    });

    it('should not start reading immeadiately orientation user is on iOS', function() {
      // This is to 'fake' a device running on iOS
      const sandbox = sinon.createSandbox();
      sandbox.spy(global.window);
      const original = global.window.navigator.userAgent;

      global.window.navigator.__defineGetter__('userAgent', () => {
        return '"Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko)'+
        ' CriOS/88.0.4292.0 Mobile/15E148 Safari/604.1"';
      });
      assert.equal(global.window.navigator.userAgent,
          'Mozilla/5.0 (iPhone; CPU OS 13_1_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Mobile/9B206');
      new MagneticDeclinationPublisher(new ROSLIB.Topic());

      assert.equal(global.window.addEventListener.callCount, 0);

      sandbox.restore();
      window.__defineGetter__('userAgent', () => {
        return original;
      });
    });
  });

  describe('#requestPermission', function() {
    it('should create a new button', function() {
      // global.window.navigator.__defineGetter__('userAgent', () => {
      //   return 'mozilla';
      // });
      new MagneticDeclinationPublisher(new ROSLIB.Topic());
      assert(global.window.document.querySelector('button') !== null);
      assert(global.window.document.getElementById('permission') !== null);
    });
  });
  describe('#onReadOrientation()', function() {
    it('should find the current location',
        function() {
          const topic = sinon.spy(new ROSLIB.Topic());
          const publisher = sinon.spy(new MagneticDeclinationPublisher(topic));

          publisher.start();

          global.eventParam = {
            'alpha': 1,
            'beta': 1,
            'gamma': 1,
          };

          const mockGeolocation = {
            getCurrentPosition: function() {
              position = {
                'coords': {
                  'latitude': 52.008254,
                  'longitude': 4.370750,
                },
              };
              return position;
            },
          };

          global.window.navigator.geolocation = mockGeolocation;

          publisher.onReadOrientation(eventParam);

          assert.equal(publisher.alpha, 359);
          assert(publisher.onReadOrientation);
        });
  });


  describe('#createSnapshot()', function() {
    /**
     * helper functions for checking whether correct error is raised
     * @param {*} error
     * @return {bool}
     */
    function orientationNotReady(error) {
      assert.equal(error.message,
          'Orientation is not read yet!');
      return true;
    }

    it('should create snapshot', function() {
      const topic = sinon.spy(new ROSLIB.Topic());
      const publisher = sinon.spy(new MagneticDeclinationPublisher(topic));

      global.eventParam = {
        'alpha': 0,
        'beta': 1,
        'gamma': 1,
      };

      const mockGeolocation = {
        getCurrentPosition: function() {
          position = {
            'coords': {
              'latitude': 52.008254,
              'longitude': 4.370750,
            },
          };
          return position;
        },
      };

      global.window.navigator.geolocation = mockGeolocation;

      publisher.onReadOrientation(eventParam);
      publisher.createSnapshot();

      const expectedMessage = new ROSLIB.Message({data: 360});
      assert.equal(topic.publish.callCount, 1);
      assert.deepEqual(topic.publish.getCall(0).args[0], expectedMessage);
    });
    it('should not create duplicate snapshot', function() {
      const topic = sinon.spy(new ROSLIB.Topic());
      const publisher = sinon.spy(new MagneticDeclinationPublisher(topic));

      global.eventParam = {
        'alpha': 0,
        'beta': 1,
        'gamma': 1,
      };

      const mockGeolocation = {
        getCurrentPosition: function() {
          position = {
            'coords': {
              'latitude': 52.008254,
              'longitude': 4.370750,
            },
          };
          return position;
        },
      };

      global.window.navigator.geolocation = mockGeolocation;

      publisher.onReadOrientation(eventParam);
      publisher.createSnapshot();
      publisher.onReadOrientation(eventParam);
      publisher.createSnapshot();

      const expectedMessage = new ROSLIB.Message({data: 360});
      assert.equal(topic.publish.callCount, 1);
      assert.deepEqual(topic.publish.getCall(0).args[0], expectedMessage);
    });
    it('should not create snapshot when orientation is not read yet', function() {
      const topic = sinon.spy(new ROSLIB.Topic());
      const publisher = sinon.spy(new MagneticDeclinationPublisher(topic));

      global.eventParam = {
        'alpha': 0,
        'beta': 1,
        'gamma': 1,
      };

      const mockGeolocation = {
        getCurrentPosition: function() {
          position = {
            'coords': {
              'latitude': 52.008254,
              'longitude': 4.370750,
            },
          };
          return position;
        },
      };

      global.window.navigator.geolocation = mockGeolocation;

      assert.throws(
          () => {
            publisher.createSnapshot();
          },
          orientationNotReady
      );
    });
  });
});
