require('../../globalSetup.js');

// Module to test
const GPSPublisher = require('../../../src/sensors/GPSPublisher.js');
const NotSupportedError = require('../../../src/error/NotSupportedError.js');
const {afterEach} = require('mocha');

/**
 * Utility function for creating geolocation mock
 * @return {Sinon.spy} geolocation spy
 */
function createGeolocationSpy() {
  const geolocation = {
    watchPosition: function(success, error, options) {
      this.onSuccess = success;
      return 1;
    },
    clearWatch: function(watchId) {},
  };

  return sinon.spy(geolocation);
}

/**
 * Utility function for creating fake GeolocationPosition
 * @param {number} longitude the longitude
 * @param {number} latitude the latitude
 * @return {any} fake GeolocationPosition
 */
function createGeolocationPosition(longitude, latitude) {
  return {
    coords: {
      longitude: longitude,
      latitude: latitude,
    },
  };
}

describe('GPSPublisher', function() {
  describe('#constructor(topic, freq)', function() {
    it('should create a new instance if the geolocation API is supported', function() {
      // mock navigator instance
      global.window.navigator.geolocation = createGeolocationSpy();
      const ros = new ROSLIB.Ros();
      const frequency = 10;

      const publisher = new GPSPublisher(ros, 'topic', frequency);

      assert.equal(publisher.ros, ros);
      assert.equal(publisher.topic.name, 'topic');
      assert.equal(publisher.freq, frequency);
    });
    it('should set the correct message type for the topic', function() {
      // mock navigator instance
      global.window.navigator.geolocation = true;
      const ros = new ROSLIB.Ros();
      const frequency = 10;

      const publisher = new GPSPublisher(ros, 'topic', frequency);

      assert.equal(publisher.topic.messageType, 'sensor_msgs/NavSatFix');
    });
    it('should throw an error if the geolocation API is not suppported', function() {
      const frequency = 10;

      assert.throws(() => new GPSPublisher(new ROSLIB.Ros(), 'topic', frequency), NotSupportedError);
    });
  });
  describe('#start()', function() {
    it('should add the correct callbacks to geolocation', function() {
      const geolocation = createGeolocationSpy();
      global.window.navigator.geolocation = geolocation;
      const ros = new ROSLIB.Ros();
      const frequency = 10;

      const publisher = new GPSPublisher(ros, 'topic', frequency);
      publisher.start();

      assert.equal(geolocation.watchPosition.callCount, 1);
    });
  });
  describe('#start()', function() {
    it('should add remove the correct callbacks from geolocation', function() {
      const geolocation = createGeolocationSpy();
      global.window.navigator.geolocation = geolocation;
      const ros = new ROSLIB.Ros();
      const frequency = 10;

      const publisher = new GPSPublisher(ros, 'topic', frequency);
      publisher.start();
      publisher.stop();

      assert.equal(geolocation.clearWatch.callCount, 1);
      assert.equal(geolocation.clearWatch.lastCall.firstArg, 1);
    });
  });
  describe('#createNavSatMessage(coordinates)', function() {
    it('should return a ROSLIB.Message', function() {
      const message = GPSPublisher.createNavSatMessage(createGeolocationPosition().coords);

      assert(message instanceof ROSLIB.Message);
    });
    it('should have the correct types for the lattitude and longitude fields', function() {
      const location = createGeolocationPosition(4.571, 44.203);
      const message = GPSPublisher.createNavSatMessage(location.coords);

      assert.equal(typeof message.longitude, 'number');
      assert.equal(typeof message.latitude, 'number');
    });
    it('should set the lattitude and longitude fields to the correct values', function() {
      const location = createGeolocationPosition(4.571, 44.203);

      const message = GPSPublisher.createNavSatMessage(location.coords);

      assert.equal(message.longitude, location.coords.longitude);
      assert.equal(message.latitude, location.coords.latitude);
    });
  });

  describe('#isSamePosition(position1, position2)', function() {
    it('should return false for positions with a different latitude', function() {
      const position1 = createGeolocationPosition(1.034, 4.2391);
      const position2 = createGeolocationPosition(33.35, 4.2391);

      assert(!GPSPublisher.isSamePosition(position1, position2));
    });
    it('should return false for positions with a different longitude', function() {
      const position1 = createGeolocationPosition(1.034, 4.2391);
      const position2 = createGeolocationPosition(1.034, 55.1002);

      assert(!GPSPublisher.isSamePosition(position1, position2));
    });
    it('should return true for positions with the same latitude and longitude', function() {
      const position1 = createGeolocationPosition(1.034, 4.2391);
      const position2 = createGeolocationPosition(1.034, 4.2391);

      assert(GPSPublisher.isSamePosition(position1, position2));
    });
  });

  describe('#createSnapshot()', function() {
    it('should publish no message if there is not yet any location data', function() {
      const geolocation = createGeolocationSpy();
      global.window.navigator.geolocation = geolocation;
      const frequency = 10;

      const publisher = new GPSPublisher(new ROSLIB.Ros(), 'topic', frequency);
      const topic = sinon.spy(publisher.topic);

      publisher.start();
      publisher.createSnapshot();

      assert.equal(topic.publish.callCount, 0);
    });
    it('should publish message if there is location data', function() {
      const geolocation = createGeolocationSpy();
      const location = createGeolocationPosition(1.034, 4.2391);
      global.window.navigator.geolocation = geolocation;
      const frequency = 10;

      const publisher = new GPSPublisher(new ROSLIB.Ros(), 'topic', frequency);
      const topic = sinon.spy(publisher.topic);
      publisher.start();
      geolocation.onSuccess(location);
      publisher.createSnapshot();

      assert.equal(topic.publish.callCount, 1);
    });
    it('should not publish a message if the location remains unchanged', function() {
      const geolocation = createGeolocationSpy();
      const location1 = createGeolocationPosition(1.034, 4.2391);
      const location2 = createGeolocationPosition(1.034, 4.2391);
      global.window.navigator.geolocation = geolocation;
      const frequency = 10;

      const publisher = new GPSPublisher(new ROSLIB.Ros(), 'topic', frequency);
      const topic = sinon.spy(publisher.topic);
      publisher.start();
      geolocation.onSuccess(location1);
      clock.tick(101);
      geolocation.onSuccess(location2);
      clock.tick(101);

      assert.equal(topic.publish.callCount, 1);
      const message = topic.publish.firstCall.firstArg;
      assert.equal(message.latitude, location1.coords.latitude);
      assert.equal(message.longitude, location1.coords.longitude);
    });
    it('should publish the current location data', function() {
      const geolocation = createGeolocationSpy();
      const location1 = createGeolocationPosition(1.034, 4.2391);
      const location2 = createGeolocationPosition(2.333, 52.99);
      global.window.navigator.geolocation = geolocation;
      const frequency = 10;

      const publisher = new GPSPublisher(new ROSLIB.Ros(), 'topic', frequency);
      const topic = sinon.spy(publisher.topic);
      publisher.start();
      geolocation.onSuccess(location1);
      geolocation.onSuccess(location2);
      publisher.createSnapshot();

      assert.equal(topic.publish.callCount, 1);
      const message = topic.publish.firstCall.firstArg;
      assert.equal(message.latitude, location2.coords.latitude);
      assert.equal(message.longitude, location2.coords.longitude);
      assert.equal(message.position_covariance_type, 0);
    });
  });

  describe('#readFromConfig(ros, config)', function() {
    it('should return a started instance of GPSPublisher', function() {
      const geolocation = createGeolocationSpy();
      global.window.navigator.geolocation = geolocation;

      const gpsName = 'gps';
      const frequency = 1.0;
      const ros = new ROSLIB.Ros();
      const config = {
        name: gpsName,
        frequency: frequency,
      };

      const publisher = GPSPublisher.readFromConfig(ros, config);

      const topicName = 'mirte/phone_gps/' + gpsName;
      assert(publisher instanceof GPSPublisher);
      assert(publisher.started);
      assert.equal(publisher.topic.name, topicName);
      assert.equal(publisher.freq, frequency);
    });
  });

  afterEach(function() {
    // make sure geolocation is reset to undefined
    global.window.navigator.geolocation = undefined;
  });
});
