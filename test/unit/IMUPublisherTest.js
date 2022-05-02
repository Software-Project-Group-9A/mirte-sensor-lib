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

describe("Test IMU Publisher", function() {


    // Constructor Tests
    describe('#constructor(topic)', function() {
        it('Browser has device motion support', function() {
            // Arrange
            window.addEventListener = sinon.spy();
            window.DeviceMotionEvent = true;    
            const topic = new ROSLIB.Topic("boo!");
            
            // Act
            const IMU = new IMUPublisher(topic);

            // Assert
            assert(window.addEventListener.callCount === 2);
        });

        it('Browser doesn\'t have device motion support', function() {
            // Arrange
            window.addEventListener = sinon.spy();
            window.alert = sinon.spy();
            window.DeviceMotionEvent = false;
            const topic = new ROSLIB.Topic("boo!");
            
            // Act
            const IMU = new IMUPublisher(topic);

           // Arrange 
            assert(window.addEventListener.callCount === 1);
            assert(window.alert.callCount === 1);
        });
    });

    // Start tests
    describe('#start()', function() {
        it('starts', function() { 
        });
    });

    // setPublishFrequency tests
    describe('#setPublishFrequency(hz)', function() {
       
        it('Frequency of 1 Hz works correctly', function () {     
            // Arrange
            var clock = sinon.useFakeTimers();
            const topic = new ROSLIB.Topic("boo!"); 
            // Setup IMU object 
            const IMU = new IMUPublisher(topic);
            IMU.createSnapshot = sinon.spy();
            IMU.orientationReady = true;
            IMU.motionReady = true;

            // Act
            IMU.setPublishFrequency(1 /*Hz*/ );
            clock.tick(200); 
            assert(IMU.createSnapshot.callCount === 0);     // After 0.2 seconds no publishment should be invoked yet

            clock.tick(800);
            assert(IMU.createSnapshot.callCount === 1);     // After exactly 1.0 seconds a single publishmunt is due.

            clock.tick(10 * 1000);                          // Wait for 10 seconds.
            assert(IMU.createSnapshot.callCount === 11);    // After exactly 11.0 seconds 11 snapshots should be created. 
            
            clock.restore();
        });


        it('Should succesfully be able to change frequency during publishing', function() {
            // Arrange
            var clock = sinon.useFakeTimers();
            const topic = new ROSLIB.Topic("boo!"); 
            // Setup IMU object 
            const IMU = new IMUPublisher(topic);
            IMU.createSnapshot = sinon.spy();
            IMU.orientationReady = true;
            IMU.motionReady = true;


            // Act
            IMU.setPublishFrequency(10);                    // Update 10 times a second.
            clock.tick(1000);                               // Forward a second.
            assert(IMU.createSnapshot.callCount === 10);    // Should call createSnapshot 10 times.

            IMU.setPublishFrequency(100);                   // Change frequency to 100 times a second.
            clock.tick(1000);                               // Forward a second.
            assert(IMU.createSnapshot.callCount === 110);   // Should call createSnapshot another 100 times.

            clock.restore();
        })
    });

    // tests
    
});