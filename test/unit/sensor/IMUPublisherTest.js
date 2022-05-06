const assert = require('assert');
const sinon = require('sinon');

// JSDOM for simulating browser environment
const {JSDOM} = require('jsdom');
const {window} = new JSDOM(``, {});

const IMUPublisher = require('../../../src/sensors/IMUPublisher.js');

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

global.Quaternion = {
  fromEuler: function() {
    return true;
  },
};
/**
 * Helper method to quickly get a working IMU going.
 * @return {IMUPublisher} a new IMU that is initialized and
 * has true flags for indicating it has read some data.
 */
function createStandardIMU() {
  const topic = new ROSLIB.Topic('boo!');
  // Setup IMU object
  const IMU = new IMUPublisher(topic);
  IMU.orientationReady = true;
  IMU.motionReady = true;
  return IMU;
}

describe('Test IMU Publisher', function() {
  // Constructor Tests
  describe('#constructor(topic)', function() {
    const sandbox = sinon.createSandbox();

    beforeEach(function() {
      sandbox.spy(global.window);
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('works when browser has device motion support', function() {
      // Arrange
      global.window.DeviceMotionEvent = true;

      // Act
      createStandardIMU();

      // Assert
      assert.equal(global.window.addEventListener.callCount, 2);
      assert(global.window.addEventListener.calledWith('deviceorientation'));
      assert(global.window.addEventListener.calledWith('devicemotion'));
    });

    it('works when browser doesn\'t have device motion support', function() {
      // Arrange
      global.window.DeviceMotionEvent = false;

      // Act
      assert.throws(() => {
        createStandardIMU();
      }, Error);

      // Arrange
      assert.equal(global.window.addEventListener.callCount, 1);
      assert(global.window.addEventListener.calledWith('deviceorientation'));
      assert.equal(global.window.alert.callCount, 1);
    });
  });

  // createSnapshot tests
  describe('#createSnapshot()', function() {
    it('throws an exception when not both flags are true');
    it('publishes to the topic.');
    it('does quarternions correctly.');
  });
});
