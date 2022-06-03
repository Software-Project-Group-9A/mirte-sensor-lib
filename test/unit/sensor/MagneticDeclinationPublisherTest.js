require('../../globalSetup.js');

// Module to test
const MagneticDeclinationPublisher =
    require('../../../src/sensors/MagneticDeclinationPublisher.js');

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
    it('should not create duplicate snapshot', function() {
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

  describe('#readFromConfig(ros, config)', function() {
    it('should return a started instance of MagneticDeclinationPublisher', function() {
      const compassName = 'compass';
      const frequency = 1.0;
      const ros = new ROSLIB.Ros();
      const config = {
        name: compassName,
        frequency: frequency,
      };

      const publisher = MagneticDeclinationPublisher.readFromConfig(ros, config);

      const topicName = 'mirte/phone_magnetic_declination/' + compassName;
      assert(publisher instanceof MagneticDeclinationPublisher);
      assert(publisher.started);
      assert.equal(publisher.topic.name, topicName);
      assert.equal(publisher.freq, frequency);
    });
  });
});
