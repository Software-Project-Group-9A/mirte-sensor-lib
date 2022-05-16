require('../../globalSetup.js');

// Module to test
const MagneticDeclinationPublisher =
    require('../../../src/sensors/MagneticDeclinationPublisher.js');

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
          expectInvalidTopic,
      );
    });
    it('should reject any topic argument ' +
        'that is not a ROSLIB.Topic instance', function() {
      assert.throws(
          () => {
            new MagneticDeclinationPublisher('not a topic');
          },
          expectInvalidTopic,
      );
    });

    it('should accept a ROSLIB.Topic', function() {
      assert.doesNotThrow(
          () => {
            new MagneticDeclinationPublisher(new ROSLIB.Topic());
          },
          (error) => {
            return false;
          },
      );
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

          assert.equal(publisher.alpha, 1);
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
          orientationNotReady,
      );
    });
  });
});
