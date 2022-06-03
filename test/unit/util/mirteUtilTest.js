require('../../globalSetup.js');

const IMUPublisher = require('../../../src/sensors/IMUPublisher.js');
const MagneticDeclinationPublisher = require('../../../src/sensors/MagneticDeclinationPublisher.js');

// module to test
const {readSensorsFromConfig} = require('../../../src/util/mirteUtil');

describe('mirteUtils', function() {
  describe('#readSensorsFromConfig(config)', function() {
    it('should return an empty map for an empty config', function() {
      const config = {};

      const sensorMap = readSensorsFromConfig(config);

      assert.equal(sensorMap.size, 0);
    });
    it('should ignore unknown sensor types in config', function() {
      const config = {
        remote_seismograph: {
          seismograph: {
            name: 'seismograph',
            frequency: 1.0,
          },
        },
      };

      const sensorMap = readSensorsFromConfig(config);

      assert.equal(sensorMap.size, 0);
    });
    it('should return IMUPublishers as specified in the config', function() {
      const ros = new ROSLIB.Ros();
      const imuFrequency = 3.7;
      const imuName = 'imu';
      const config = {
        phone_imu: {
          imu: {
            name: imuName,
            frequency: imuFrequency,
          },
        },
      };

      const sensorMap = readSensorsFromConfig(config, ros);

      const topicName = 'mirte/phone_imu/' + imuName;
      assert.equal(sensorMap.size, 1);
      assert(sensorMap.has(topicName));
      const imuPublisher = sensorMap.get(topicName);
      assert(imuPublisher instanceof IMUPublisher);
      assert.equal(imuPublisher.topic.name, topicName);
      assert.equal(imuPublisher.freq, imuFrequency);
    });
    it('should return MagneticDeclinationPublishers as specified in the config', function() {
      const magneticDeclinationName = 'compass';
      const ros = new ROSLIB.Ros();
      const config = {
        remote_magnetic_declination: {
          compass: {
            name: magneticDeclinationName,
          },
        },
      };

      const sensorMap = readSensorsFromConfig(config, ros);

      const topicName = 'mirte/phone_magnetic_declination/' + magneticDeclinationName;
      assert.equal(sensorMap.size, 1);
      assert(sensorMap.has(topicName));
      const imuPublisher = sensorMap.get(topicName);
      assert(imuPublisher instanceof MagneticDeclinationPublisher);
      assert.equal(imuPublisher.topic.name, topicName);
    });
  });
});
