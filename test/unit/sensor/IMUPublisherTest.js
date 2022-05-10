const assert = require('assert');
const sinon = require('sinon');
const THREE = require('three');

// JSDOM for simulating browser environment
const {JSDOM} = require('jsdom');
const {window} = new JSDOM(``, {});

const IMUPublisher = require('../../../src/sensors/IMUPublisher.js');
const exp = require('constants');

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
    /**
     * Asserts that acual is in range of expected 
     * @param {*} actual 
     * @param {*} expected 
     * @param {*} range 
     */
    function closeTo(actual, expected, range) {
      console.log('lower bound: ' + (expected - range) + ' upper bound: ' + (expected + range) + ' actual: ' + actual);
      assert( expected - range <= actual );
      assert( expected + range >= actual );
    }

    it('publishes to the topic.', function() {
      global.window.DeviceMotionEvent = true;
      // Arrange
      const topic = new ROSLIB.Topic('boo!');
      // Spy on topic
      const topicSpy = sinon.spy(topic);
      // Setup IMU object
      const IMU = new IMUPublisher(topic);
      IMU.orientationReady = true;
      IMU.motionReady = true;

      // Act
      IMU.createSnapshot();

      // Arrange
      assert.equal(topicSpy.publish.callCount, 1);
    });

    it('does 0.0 deg quarternions correctly.', function() {
      // Arrange
      global.window.DeviceMotionEvent = true;
      const topic = new ROSLIB.Topic('boo!');
      // Spy on topic
      const topicSpy = sinon.spy(topic);
      // Setup IMU object
      const imu = new IMUPublisher(topic);
      imu.orientationReady = true;
      imu.motionReady = true;
      imu.alpha = 0.0;
      imu.beta = 0.0;
      imu.gamma = 0.0;

      // Act
      imu.createSnapshot();
      const msg = topicSpy.publish.args[0];

      // Assert
      const msgQuat= msg[0].msg.orientation;
      assert.deepEqual(msgQuat, {x: 0, y: 0, z: 0, w: 1});
    });

    it('does different deg quarternions correctly.', function() {
      // Arrange
      global.window.DeviceMotionEvent = true;
      const topic = new ROSLIB.Topic('boo!');
      // Spy on topic
      const topicSpy = sinon.spy(topic);
      // Setup IMU object
      const imu = new IMUPublisher(topic);
      imu.orientationReady = true;
      imu.motionReady = true;
      imu.beta = 45.0; // 45 degrees over X-axis (Pitch)
      imu.gamma = 75.0; // 75 degrees over Y-axis (Pitch)
      imu.alpha = 90.0; // 90 degrees over Z-axis (Yaw)

      // Act
      imu.createSnapshot();
      const msg = topicSpy.publish.args[0];

      // Assert
      const msgCords = msg[0].msg.orientation;
      const msgQuat = new THREE.Quaternion(msgCords.x, msgCords.y, msgCords.z, msgCords.w);
      const q = new THREE.Euler().setFromQuaternion(msgQuat);

      const rad = 180/ Math.PI;
      closeTo(q.x * rad, 45.0, 0.05); // x axis should be beta
      closeTo(q.y * rad, 75.0, 0.05); // y axis should be gamma
      closeTo(q.z * rad, 90.0, 0.05); // z axis should be alpha
    });
  });
});
