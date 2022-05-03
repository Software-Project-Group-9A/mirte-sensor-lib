var assert = require('assert')
const sinon = require('sinon');

// JSDOM for simulating browser environment
const { JSDOM } = require('jsdom');
const { window } = new JSDOM(``, {});

const IntervalPublisher = require('../../../src/sensors/IntervalPublisher.js');


// define JSDOM window in global scope 
global.window = global.window || window;
const { document } = global.window;

// create dummy for ROS 
global.ROSLIB = {
    Topic: function() {
        this.publish = function(msg) {}
    },
    Message: function(msg) {
        this.msg = msg
    }
}


function createIntervalPublisher() {
    const topic = new ROSLIB.Topic('boo!');    
    const IVPublisher = new IntervalPublisher(topic);
    // Mock createSnapshot out
    IVPublisher.createSnapshot = sinon.spy();
    return IVPublisher;
}

describe('Test IntervalPublisher', function () {

   // setPublishFrequency tests
    describe('#setPublishFrequency(hz)', function() {
       
        it('Frequency of 1 Hz works correctly', function () {     
            // Arrange
            var clock = sinon.useFakeTimers();
            // Setup IMU object 
            const IVPublisher = createIntervalPublisher();
            IVPublisher.createSnapshot = sinon.spy();

            // Act and Assert
            IVPublisher.setPublishFrequency(1 /*Hz*/ );
            clock.tick(200); 
            assert.equal(IVPublisher.createSnapshot.callCount, 0);     // After 0.2 seconds no publishment should be invoked yet

            clock.tick(800);
            assert.equal(IVPublisher.createSnapshot.callCount, 1);     // After exactly 1.0 seconds a single publishmunt is due.

            clock.tick(10 * 1000);                          // Wait for 10 seconds.
            assert.equal(IVPublisher.createSnapshot.callCount, 11);    // After exactly 11.0 seconds 11 snapshots should be created. 
            
            clock.restore();
        });


        it('Should succesfully be able to change frequency during publishing', function() {
            // Arrange
            var clock = sinon.useFakeTimers();
            const IVPublisher = createIntervalPublisher();
            IVPublisher.createSnapshot = sinon.spy();
 
            // Act
            IVPublisher.setPublishFrequency(10);                    // Update 10 times a second.
            clock.tick(1000);                               // Forward a second.
            assert.equal(IVPublisher.createSnapshot.callCount, 10);    // Should call createSnapshot 10 times.

            IVPublisher.setPublishFrequency(100);                   // Change frequency to 100 times a second.
            clock.tick(1000);                               // Forward a second.
            assert.equal(IVPublisher.createSnapshot.callCount, 110);   // Should call createSnapshot another 100 times.

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

        beforeEach(function () {
            sandbox.spy(global, 'clearInterval');
        });

        afterEach(function () {
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
            IVPublisher.timer = undefined;

            // Act
            IVPublisher.stop();

            // Assert
            assert.equal(global.clearInterval.callCount, 1);
        });
 
    });
});

