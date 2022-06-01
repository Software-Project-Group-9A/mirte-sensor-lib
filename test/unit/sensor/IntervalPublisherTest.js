require('../../globalSetup.js');

const IntervalPublisher = require('../../../src/sensors/IntervalPublisher.js');

/**
 * Helper method to create a new Interval Publisher implementation.
 * @return {IntervalPublisher} a publisher object.
 */
function createIntervalPublisher() {
  const ros = new ROSLIB.Ros();
  const IVPublisher = new IntervalPublisher(ros, 'topic');
  // Mock createSnapshot out
  IVPublisher.createSnapshot = sinon.spy();
  return IVPublisher;
}

describe('Test IntervalPublisher', function() {
  describe('#constructor(topic)', function() {
    /**
     * Helper functions for checking whether correct error is raised for
     * invalid topics.
     * @param {Error} error The raised error.
     * @return {boolean} true if valid.
     */
    function expectInvalidFrequency(error) {
      assert(error instanceof Error);

      return true;
    }

    /* tests for topic verification */
    it('should construct with 10Hz when not defined', function() {
      let publisher;
      const ros = new ROSLIB.Ros();

      assert.doesNotThrow(
          () => {
            publisher = new IntervalPublisher(ros, 'topic');
          },
          (error) => {
            return false;
          }
      );

      assert.equal(publisher.freq, 10);
    });
    it('should construct with other Hz when defined', function() {
      let publisher;
      const ros = new ROSLIB.Ros();

      assert.doesNotThrow(
          () => {
            publisher = new IntervalPublisher(ros, 'topic', 20);
          },
          (error) => {
            return false;
          }
      );

      assert.equal(publisher.freq, 20);
    });

    it('should construct with 10Hz when it is invalid', function() {
      const ros = new ROSLIB.Ros();

      assert.throws(() => {
        new IntervalPublisher(ros, 'topic', 0);
      }, expectInvalidFrequency);
    });
  });


  // setPublishFrequency tests
  describe('#setPublishFrequency(hz)', function() {
    /**
     * Helper functions for checking whether correct error is raised.
     * @param {Error} error The raised error.
     * @return {boolean} true if valid.
     */
    function expectInvalidFrequency(error) {
      assert(error instanceof Error);

      return true;
    }

    it('Frequency of 1 Hz works correctly', function() {
      // Arrange
      // Setup IMU object
      const IVPublisher = createIntervalPublisher();
      IVPublisher.start();
      IVPublisher.createSnapshot = sinon.spy();

      // Act and Assert
      IVPublisher.setPublishFrequency(1 /* Hz*/ );
      clock.tick(200);

      // After 0.2 seconds no publishment should be invoked yet
      assert.equal(IVPublisher.createSnapshot.callCount, 0);

      clock.tick(800);
      // After exactly 1.0 seconds a single publishmunt is due.
      assert.equal(IVPublisher.createSnapshot.callCount, 1);

      clock.tick(10 * 1000); // Wait for 10 seconds.
      // After exactly 11.0 seconds 11 snapshots should be created.
      assert.equal(IVPublisher.createSnapshot.callCount, 11);
    });


    it('Should be able to change frequency during publishing', function() {
      // Arrange
      const IVPublisher = createIntervalPublisher();
      IVPublisher.start();
      IVPublisher.createSnapshot = sinon.spy();

      // Act
      IVPublisher.setPublishFrequency(10); // Update 10 times a second.
      clock.tick(1000); // Forward a second.
      // Should call createSnapshot 10 times.
      assert.equal(IVPublisher.createSnapshot.callCount, 10);

      // Change frequency to 100 times a second.
      IVPublisher.setPublishFrequency(100);
      clock.tick(1000); // Forward a second.

      // Should call createSnapshot another 100 times.
      assert.equal(IVPublisher.createSnapshot.callCount, 110);
    });

    it('Should restart when already started', function() {
      // Arrange
      const IVPublisher = createIntervalPublisher();
      IVPublisher.start();
      IVPublisher.start = sinon.spy();
      IVPublisher.stop = sinon.spy();

      // Act
      IVPublisher.setPublishFrequency(10);
      IVPublisher.setPublishFrequency(100);
      IVPublisher.setPublishFrequency(1);

      // Assert
      assert.equal(IVPublisher.stop.callCount, 3);
      assert.equal(IVPublisher.start.callCount, 3);
    });

    it('Should not restart when not started yet', function() {
      // Arrange
      const IVPublisher = createIntervalPublisher();
      IVPublisher.start = sinon.spy();
      IVPublisher.stop = sinon.spy();

      // Act
      IVPublisher.setPublishFrequency(10);
      IVPublisher.setPublishFrequency(100);
      IVPublisher.setPublishFrequency(1);

      // Assert
      assert.equal(IVPublisher.stop.callCount, 0);
      assert.equal(IVPublisher.start.callCount, 0);
    });

    it('Frequency of 0 Hz does not work', function() {
      // Setup IMU object
      const IVPublisher = createIntervalPublisher();
      IVPublisher.start();

      // Act and Assert
      IVPublisher.setPublishFrequency(10 /* Hz*/ );

      assert.throws(() => {
        IVPublisher.setPublishFrequency(0 /* Hz*/ );
      }, expectInvalidFrequency);
      assert.equal(IVPublisher.freq, 10);
    });
  });

  // start tests
  describe('#start()', function() {
    it('should start a timer', function() {
      // Arrange
      const IVPublisher = createIntervalPublisher();
      const intervalSpy = sinon.spy(global, 'setInterval');
      // Act
      IVPublisher.start();
      // Assert
      assert.equal(intervalSpy.callCount, 1);
    });
  });

  // stop tests
  describe('#stop()', function() {
    const sandbox = sinon.createSandbox();

    beforeEach(function() {
      sandbox.spy(global, 'clearInterval');
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('should stop a timer', function() {
      // Arrange
      const IVPublisher = createIntervalPublisher();
      IVPublisher.start();

      // Act
      IVPublisher.stop();

      // Assert
      assert.equal(global.clearInterval.callCount, 1);
    });

    it('should accept a non-existent timer', function() {
      // Arrange
      const IVPublisher = createIntervalPublisher();
      IVPublisher.start();
      IVPublisher.timer = undefined;

      // Act
      IVPublisher.stop();

      // Assert
      assert.equal(global.clearInterval.callCount, 1);
    });
  });

  // create snapshot tests
  describe('#createSnapshot(msg)', function() {
    it('should publish', function() {
      // Arrange
      const publisher = new IntervalPublisher(new ROSLIB.Ros(), 'topic');
      const topic = sinon.spy(publisher.topic);
      const msg = new ROSLIB.Message({
        data: true,
      });

      // Act
      publisher.createSnapshot(msg);

      // Assert
      assert.equal(topic.publish.callCount, 1);
    });

    it('should not publish double', function() {
      // Arrange
      const publisher = new IntervalPublisher(new ROSLIB.Ros(), 'topic');
      const topic = sinon.spy(publisher.topic);
      const msg = new ROSLIB.Message({
        data: true,
      });

      // Act
      publisher.createSnapshot(msg);
      publisher.createSnapshot(msg);

      // Assert
      assert.equal(topic.publish.callCount, 1);
    });

    it('should publish new', function() {
      // Arrange
      const publisher = new IntervalPublisher(new ROSLIB.Ros(), 'topic');
      const topic = sinon.spy(publisher.topic);
      const msg1 = new ROSLIB.Message({
        data: true,
      });
      const msg2 = new ROSLIB.Message({
        data: false,
      });

      // Act
      publisher.createSnapshot(msg1);
      publisher.createSnapshot(msg2);

      // Assert
      assert.equal(topic.publish.callCount, 2);
    });
  });
});

