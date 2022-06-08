require('../../globalSetup.js');

// Module to test
const MagneticDeclinationPublisher =
    require('../../../src/sensors/MagneticDeclinationPublisher.js');

// define JSDOM window in global scope, if not already defined
describe('Test MagneticDeclinationPublisher', function() {
  describe('#constructor(topic)', function() {
    it('should correctly construct a publisher and not start reading yet', function() {
      let publisher;
      assert.doesNotThrow(
          () => {
            publisher = new MagneticDeclinationPublisher(new ROSLIB.Ros(), 'topic');
          },
          (error) => {
            return false;
          }
      );
      assert.equal(publisher.orientationReady, false);
    });

    it('should not start reading immeadiately orientation user is on iOS', function() {
      // This is to 'fake' a device running on iOS
      const sandbox = sinon.createSandbox();
      sandbox.spy(global.window);
      const original = global.window.navigator.userAgent;

      global.window.navigator.__defineGetter__('userAgent', () => {
        return 'Mozilla/5.0 (iPhone; CPU OS 13_1_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Mobile/9B206';
      });
      assert.equal(global.window.navigator.userAgent,
          'Mozilla/5.0 (iPhone; CPU OS 13_1_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Mobile/9B206');

      const publisher = sinon.spy(new MagneticDeclinationPublisher(new ROSLIB.Ros(), 'topic'));

      assert.equal(publisher.requestPermission.callCount, 0);

      sandbox.restore();
      window.__defineGetter__('userAgent', () => {
        return original;
      });
    });
  });

  describe('#requestPermission', function() {
    it('should create a new button', function() {
      sinon.spy(new MagneticDeclinationPublisher(new ROSLIB.Ros(), 'topic'));

      assert(global.window.document.querySelector('button') !== null);
    });
  });
  describe('#onReadOrientation()', function() {
    it('should find the current location',
        function() {
          const publisher = sinon.spy(new MagneticDeclinationPublisher(new ROSLIB.Ros(), 'topic'));

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
      const publisher = sinon.spy(new MagneticDeclinationPublisher(new ROSLIB.Ros(), 'topic'));
      const topic = sinon.spy(publisher.topic);

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
    it('should not create snapshot when orientation is not read yet', function() {
      const publisher = sinon.spy(new MagneticDeclinationPublisher(new ROSLIB.Ros(), 'topic'));

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
