require('../../globalSetup.js');

const IMUPublisher = require('../../../src/sensors/IMUPublisher.js');
const CompassPublisher = require('../../../src/sensors/CompassPublisher.js');

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
            topicPath: '/mirte/seismograph',
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

      const topicName = '/mirte/phone_imu/' + imuName;
      assert.equal(sensorMap.size, 1);
      assert(sensorMap.has(topicName));
      const imuPublisher = sensorMap.get(topicName);
      assert(imuPublisher instanceof IMUPublisher);
      assert.equal(imuPublisher.topic.name, topicName);
      assert.equal(imuPublisher.freq, imuFrequency);
    });
    it('should return CompassPublishers as specified in the config', function() {
      const compassName = 'compass';
      const ros = new ROSLIB.Ros();
      const config = {
        phone_compass: {
          compass: {
            name: compassName,
          },
        },
      };

      const sensorMap = readSensorsFromConfig(config, ros);

      const topicName = '/mirte/phone_compass/' + compassName;
      assert.equal(sensorMap.size, 1);
      assert(sensorMap.has(topicName));
      const compassPublisher = sensorMap.get(topicName);
      assert(compassPublisher instanceof CompassPublisher);
      assert.equal(compassPublisher.topic.name, topicName);
    });
  });
});
