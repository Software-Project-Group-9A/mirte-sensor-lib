require('../../globalSetup.js');

// Module to test
const CompassPublisher =
    require('../../../src/sensors/CompassPublisher.js');

// define JSDOM window in global scope, if not already defined
describe('Test CompassPublisher', function() {
  describe('#constructor(ros, topicName, hz)', function() {
    it('should correctly construct a publisher and not start reading yet', function() {
      let publisher;
      assert.doesNotThrow(
          () => {
            publisher = new CompassPublisher(new ROSLIB.Ros(), 'topic');
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

      const publisher = sinon.spy(new CompassPublisher(new ROSLIB.Ros(), 'topic'));

      assert.equal(publisher.requestPermission.callCount, 0);

      sandbox.restore();
      window.__defineGetter__('userAgent', () => {
        return original;
      });
    });
  });

  describe('#requestPermission', function() {
    // Set-up sandbox
    const sandbox = sinon.createSandbox();

    beforeEach(function() {
      // Reset entire global window
      global.window.alert = function() {};
      sandbox.spy(global.window.document);
    });

    afterEach(function() {
      sandbox.restore();
    });


    it('should create a new button for iOS', function() {
      // Arrange
      global.window.navigator.__defineGetter__('userAgent', () => {
        return 'Mozilla/5.0 (iPhone; CPU OS 13_1_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Mobile/9B206';
      });

      // Act
      new CompassPublisher(new ROSLIB.Ros(), 'topic');

      // Assert
      assert.equal(global.window.navigator.userAgent,
          'Mozilla/5.0 (iPhone; CPU OS 13_1_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Mobile/9B206');
      assert(!global.window.document.createElement.called);
    });

    it('should not create a new button for Android', function() {
      // Arrange
      global.window.navigator.__defineGetter__('userAgent', () => {
        return ' Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US; rv:1.9.1.5) Gecko/20091102 Firefox/3.5.5' +
         '(.NET CLR 3.5.30729)';
      });

      // Act
      new CompassPublisher(new ROSLIB.Ros(), 'topic');

      // Assert
      assert(!global.window.document.createElement.called);
    });
  });
  describe('#onReadOrientation()', function() {
    it('should find the current location',
        function() {
          const publisher = sinon.spy(new CompassPublisher(new ROSLIB.Ros(), 'topic'));

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
      const publisher = sinon.spy(new CompassPublisher(new ROSLIB.Ros(), 'topic'));
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
      const publisher = sinon.spy(new CompassPublisher(new ROSLIB.Ros(), 'topic'));

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

  describe('#readFromConfig(ros, config)', function() {
    it('should return a started instance of CompassPublisher', function() {
      const compassName = 'compass';
      const frequency = 1.0;
      const ros = new ROSLIB.Ros();
      const config = {
        name: compassName,
        topicPath: 'mirte/phone_compass',
        frequency: frequency,
      };

      const publisher = CompassPublisher.readFromConfig(ros, config);

      const topicName = config.topicPath + '/' + compassName;
      assert(publisher instanceof CompassPublisher);
      assert(publisher.started);
      assert.equal(publisher.topic.name, topicName);
      assert.equal(publisher.freq, frequency);
    });
  });
});
