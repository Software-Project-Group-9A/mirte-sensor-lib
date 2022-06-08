const assert = require('assert');
const sinon = require('sinon');
const THREE = require('three');

// JSDOM for simulating browser environment
const {JSDOM} = require('jsdom');
const {window} = new JSDOM(``, {});

// Module to test
const IMUPublisher = require('../../../src/sensors/IMUPublisher.js');

// define JSDOM window in global scope, if not already defined
global.window = global.window || window;
// const {document} = global.window;
require('../../globalSetup.js');

/**
 * Helper method to quickly get a working IMU going.
 * @return {IMUPublisher} a new IMU that is initialized and
 * has true flags for indicating it has read some data.
 */
function createStandardIMU() {
  const ros = new ROSLIB.Ros();
  // Setup IMU object
  const IMU = new IMUPublisher(ros, 'topic');
  IMU.orientationReady = true;
  IMU.motionReady = true;
  return IMU;
}

describe('Test IMU Publisher', function() {
  // Constructor Tests
  describe('#constructor(topic)', function() {
    const sandbox = sinon.createSandbox();

    beforeEach(function() {
      global.window.alert = function() {};
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
      createStandardIMU();

      // Arrange
      assert.equal(global.window.addEventListener.callCount, 1);
      assert(global.window.addEventListener.calledWith('deviceorientation'));
      assert.equal(global.window.alert.callCount, 1);
    });
    it('should not start reading orientation user is on iOS', function() {
      // This is to 'fake' a device running on iOS
      const original = global.window.navigator.userAgent;
      global.window.navigator.__defineGetter__('userAgent', () => {
        return 'Mozilla/5.0 (iPhone; CPU OS 13_1_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Mobile/9B206';
      });
      assert.equal(global.window.navigator.userAgent,
          'Mozilla/5.0 (iPhone; CPU OS 13_1_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Mobile/9B206');
      const imu = sinon.spy( createStandardIMU());
      imu.requestPermission = sinon.stub();

      assert.equal(imu.requestPermission.callCount, 0);

      global.window.navigator.__defineGetter__('userAgent', () => {
        return original;
      });
    });
  });

  // requestPermission tests
  describe('#requestPermission', function() {
    it('should create a new button for iOS', function() {
      const sandbox = sinon.createSandbox();
      const originalAgent = global.window.navigator.userAgent;

      sandbox.spy(global.window);
      global.window.navigator.__defineGetter__('userAgent', () => {
        return 'Mozilla/5.0 (iPhone; CPU OS 13_1_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Mobile/9B206';
      });
      const publisher = sinon.spy(createStandardIMU());

      assert.equal(publisher.requestPermission.callCount, 0);
      assert(global.window.document.querySelector('button') !== null);

      sandbox.restore();
      global.window.navigator.__defineGetter__('userAgent', () => {
        return originalAgent;
      });
    });
  });

  // createSnapshot tests
  describe('#createSnapshot()', function() {
    global.window.DeviceMotionEvent = true;

    /**
     * Asserts that acual is in range of expected
     * @param {Number} actual the value found during the test
     * @param {Number} expected the value that is expected
     * @param {Number} range the range actual can be off
     */
    function closeTo(actual, expected, range) {
      // console.log('lower bound: ' + (expected - range) +
      //    ' upper bound: ' + (expected + range) + ' actual: ' + actual);
      assert( expected - range <= actual );
      assert( expected + range >= actual );
    }

    it('publishes to the topic.', function() {
      // Setup IMU object
      const IMU = new IMUPublisher(new ROSLIB.Ros(), 'topic');
      // Spy on topic
      const topicSpy = sinon.spy(IMU.topic);

      IMU.orientationReady = true;
      IMU.motionReady = true;

      // Act
      IMU.createSnapshot();

      // Arrange
      assert.equal(topicSpy.publish.callCount, 1);
    });

    it('does 0.0 deg quarternions correctly.', function() {
      // Setup IMU object
      const imu = new IMUPublisher(new ROSLIB.Ros(), 'topic');
      // Spy on topic
      const topicSpy = sinon.spy(imu.topic);

      imu.orientationReady = true;
      imu.motionReady = true;

      imu.alpha = 0.0;
      imu.beta = 0.0;
      imu.gamma = 0.0;

      // Act
      imu.createSnapshot();
      const msg = topicSpy.publish.args[0];

      // Assert
      const msgQuat= msg[0].orientation;
      assert.deepEqual(msgQuat, {x: 0, y: 0, z: 0, w: 1});
    });

    it('does different deg quarternions correctly.', function() {
      // Setup IMU object
      const imu = new IMUPublisher(new ROSLIB.Ros(), 'topic');
      // Spy on topic
      const topicSpy = sinon.spy(imu.topic);

      imu.orientationReady = true;
      imu.motionReady = true;
      imu.beta = 45.0; // 45 degrees over X-axis (Pitch)
      imu.gamma = 75.0; // 75 degrees over Y-axis (Pitch)
      imu.alpha = 90.0; // 90 degrees over Z-axis (Yaw)

      // Act
      imu.createSnapshot();
      const msg = topicSpy.publish.args[0];

      // Assert
      const msgCords = msg[0].orientation;
      const msgQuat = new THREE.Quaternion(msgCords.x, msgCords.y, msgCords.z, msgCords.w);
      const q = new THREE.Euler().setFromQuaternion(msgQuat);
      // Check if angles are valid
      const rad = 180/ Math.PI;
      closeTo(q.x * rad, 45.0, 0.05); // x axis should be beta
      closeTo(q.y * rad, 75.0, 0.05); // y axis should be gamma
      closeTo(q.z * rad, 90.0, 0.05); // z axis should be alpha
      // Check if ROS-messages recognises data as defined.
      assert.equal(msg[0].orientation_covariance[0], 0);
      assert.equal(msg[0].angular_velocity_covariance[0], 0);
      assert.equal(msg[0].linear_acceleration_covariance[0], 0);
    });

    it('has -1 hardcoded in the covar-matrix when phone orientattion has not occured', function() {
      // Setup IMU object
      const imu = new IMUPublisher(new ROSLIB.Ros(), 'topic');
      // Spy on topic
      const topicSpy = sinon.spy(imu.topic);

      imu.orientationReady = false;
      imu.motionReady = true;

      // Act
      imu.createSnapshot();
      const msg = topicSpy.publish.args[0];

      // Assert
      assert.equal(msg[0].orientation_covariance[0], -1);
      assert.equal(msg[0].angular_velocity_covariance[0], 0);
      assert.equal(msg[0].linear_acceleration_covariance[0], 0);
    });

    it('has -1 hardcoded in the covar-matrix when motion event has not yet occured', function() {
      // Setup IMU object
      const imu = new IMUPublisher(new ROSLIB.Ros(), 'topic');
      // Spy on topic
      const topicSpy = sinon.spy(imu.topic);

      imu.orientationReady = true;
      imu.motionReady = false;

      // Act
      imu.createSnapshot();
      const msg = topicSpy.publish.args[0];

      // Assert
      assert.equal(msg[0].orientation_covariance[0], 0);
      assert.equal(msg[0].angular_velocity_covariance[0], -1);
      assert.equal(msg[0].linear_acceleration_covariance[0], -1);
    });

    it('has -1 hardcoded in the covar-matrix when neither events have occured', function() {
      // Setup IMU object
      const imu = new IMUPublisher(new ROSLIB.Ros(), 'topic');
      // Spy on topic
      const topicSpy = sinon.spy(imu.topic);

      imu.orientationReady = false;
      imu.motionReady = false;

      // Act
      imu.createSnapshot();
      const msg = topicSpy.publish.args[0];

      // Assert
      assert.equal(msg[0].orientation_covariance[0], -1);
      assert.equal(msg[0].angular_velocity_covariance[0], -1);
      assert.equal(msg[0].linear_acceleration_covariance[0], -1);
    });
  });
});
