var assert = require('assert')
const sinon = require('sinon');

// JSDOM for simulating browser environment
const { JSDOM } = require('jsdom');
const { window } = new JSDOM(``, {});
const { document } = window;

// define JSDOM window in global scope 
global.window = window;
// create spy for Topic
global.ROSLIB = {
    Topic: function() {
        this.publish = function(msg) {}
    },
    Message: function(msg) {
        this.msg = msg
    }
}

const IMUPublisher = require('../../src/sensors/IMUPublisher.js');
const { I } = require('quaternion');

/**
 * Helper method to quickly get a working IMU going. 
 * @returns a new IMU that is initialized and has true flags for indicating it has read some data. 
 */
function createStandardIMU() {
    const topic = new ROSLIB.Topic("boo!"); 
    // Setup IMU object 
    const IMU = new IMUPublisher(topic);
    IMU.orientationReady = true;
    IMU.motionReady = true;
    return IMU;
}


describe("Test IMU Publisher", function() {
    
    // Constructor Tests
    describe('#constructor(topic)', function() {

        it('works when browser has device motion support', function() {
            // Arrange
            window.addEventListener = sinon.spy();
            window.DeviceMotionEvent = true;    
            const topic = new ROSLIB.Topic("boo!");
            
            // Act
            const IMU = new IMUPublisher(topic);

            // Assert
            assert.equal(window.addEventListener.callCount, 2);
        });

        it('works when browser doesn\'t have device motion support', function() {
            // Arrange
            window.addEventListener = sinon.spy();
            window.alert = sinon.spy();
            window.DeviceMotionEvent = false;
            const topic = new ROSLIB.Topic("boo!");
            
            // Act
            const IMU = new IMUPublisher(topic);

           // Arrange 
            assert.equal(window.addEventListener.callCount, 1);
            assert.equal(window.alert.callCount, 1);
        });
    });

    // setPublishFrequency tests
    describe('#setPublishFrequency(hz)', function() {
       
        it('Frequency of 1 Hz works correctly', function () {     
            // Arrange
            var clock = sinon.useFakeTimers();
            // Setup IMU object 
            const IMU = createStandardIMU();
            IMU.createSnapshot = sinon.spy();

            // Act and Assert
            IMU.setPublishFrequency(1 /*Hz*/ );
            clock.tick(200); 
            assert.equal(IMU.createSnapshot.callCount, 0);     // After 0.2 seconds no publishment should be invoked yet

            clock.tick(800);
            assert.equal(IMU.createSnapshot.callCount, 1);     // After exactly 1.0 seconds a single publishmunt is due.

            clock.tick(10 * 1000);                          // Wait for 10 seconds.
            assert.equal(IMU.createSnapshot.callCount, 11);    // After exactly 11.0 seconds 11 snapshots should be created. 
            
            clock.restore();
        });


        it('Should succesfully be able to change frequency during publishing', function() {
            // Arrange
            var clock = sinon.useFakeTimers();
            const IMU = createStandardIMU();
            IMU.createSnapshot = sinon.spy();
 
            // Act
            IMU.setPublishFrequency(10);                    // Update 10 times a second.
            clock.tick(1000);                               // Forward a second.
            assert.equal(IMU.createSnapshot.callCount, 10);    // Should call createSnapshot 10 times.

            IMU.setPublishFrequency(100);                   // Change frequency to 100 times a second.
            clock.tick(1000);                               // Forward a second.
            assert.equal(IMU.createSnapshot.callCount, 110);   // Should call createSnapshot another 100 times.

            clock.restore();
        });

        it('Should have the publisher restart at change of frequency', function() {
            // Arrange
            const IMU = createStandardIMU();
            IMU.start = sinon.spy();
            IMU.stop = sinon.spy();

            // Act
            IMU.setPublishFrequency(10);            
            IMU.setPublishFrequency(100);            
            IMU.setPublishFrequency(1);            

            // Assert
            assert.equal(IMU.stop.callCount, 3);
            assert.equal(IMU.start.callCount, 3);
        });
    });

    // start tests
    describe('#start()', function() {
        it('should start a timer', function() {
            // Arrange
            // Setup IMU object 
            const IMU = createStandardIMU();
            const intervalSpy = sinon.spy(global, 'setInterval'); 
            // Act
            IMU.start();  
            // Assert
            assert.equal(intervalSpy.callCount, 1);
        });
    });

    // stop tests
    describe('#stop()', function() {
        const sandbox = sinon.createSandbox();

        beforeEach(function () {
            sandbox.spy(global, 'clearInterval');
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('should stop a timer', function() {
            // Arrange
            const IMU = createStandardIMU();
            IMU.start();  

            // Act
            IMU.stop();

            // Assert
            assert.equal(global.clearInterval.callCount, 1);
        });

        it('should accept a non-existent timer', function() {
            // Arrange
            const IMU = createStandardIMU();
            IMU.timer = undefined;

            // Act
            IMU.stop();

            // Assert
            assert.equal(global.clearInterval.callCount, 1);
        });
 
    });


    // createSnapshot tests
    describe('#createSnapshot()', function() {
        it('throws an exception when not both flags are true');
        it('publishes to the topic.');
        it('does quarternions correctly.');
    });
});