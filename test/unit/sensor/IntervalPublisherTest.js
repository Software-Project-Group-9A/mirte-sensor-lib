const assert = require('assert');
const sinon = require('sinon');

// JSDOM for simulating browser environment
const {JSDOM} = require('jsdom');
const {window} = new JSDOM(``, {});

const IntervalPublisher = require('../../../src/sensors/IntervalPublisher.js');


// define JSDOM window in global scope
global.window = global.window || window;
// const {document} = global.window;

// create dummy for ROS
global.ROSLIB = {
  Topic: function() {
    this.publish = function(msg) {};
  },
  Message: function(msg) {
    this.msg = msg;
  },
};

/**
 * Helper method to create a new Interval Publisher implementation.
 * @return {IntervalPublisher} a publisher object.
 */
function createIntervalPublisher() {
  const topic = new ROSLIB.Topic('boo!');
  const IVPublisher = new IntervalPublisher(topic);
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
      const topic = new ROSLIB.Topic();

      assert.doesNotThrow(
          () => {
            publisher = new IntervalPublisher(topic);
          },
          (error) => {
            return false;
          },
      );

      assert.equal(publisher.freq, 10);
    });
    it('should construct with other Hz when defined', function() {
      let publisher;
      const topic = new ROSLIB.Topic();

      assert.doesNotThrow(
          () => {
            publisher = new IntervalPublisher(topic, 20);
          },
          (error) => {
            return false;
          },
      );

      assert.equal(publisher.freq, 20);
    });

    it('should construct with 10Hz when it is invalid', function() {
      const topic = new ROSLIB.Topic();

      assert.throws(() => {
        new IntervalPublisher(topic, 0);
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
      const clock = sinon.useFakeTimers();
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

      clock.restore();
    });


    it('Should be able to change frequency during publishing', function() {
      // Arrange
      const clock = sinon.useFakeTimers();
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
      clock.restore();
    });

    it('Should have the publisher restart at change of frequency', function() {
      // Arrange
      const IVPublisher = createIntervalPublisher();
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
});

