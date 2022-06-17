const CameraPublisher = require('../sensors/CameraPublisher');
const CompassPublisher = require('../sensors/CompassPublisher');
const CoordinateCompassPublisher = require('../sensors/CoordinateCompassPublisher');
const GPSPublisher = require('../sensors/GPSPublisher');
const IMUPublisher = require('../sensors/IMUPublisher');

/**
 * Array containing deserializers for every type of sensor.
 * An deserializers is a function that takes a ros instance and a properties object,
 * and returns the corresponding SensorPublisher.
 */
const sensorDeserializers = {
  'phone_imu': IMUPublisher.readFromConfig,
  'phone_compass': CompassPublisher.readFromConfig,
  'phone_gps': GPSPublisher.readFromConfig,
  'phone_point_to_coordinate': CoordinateCompassPublisher.readFromConfig,
  'phone_camera': CameraPublisher.readFromConfig,
};

/**
 * Reads the mirte ROS parameters and publishes sensors as indicated
 * in the mirte parameters.
 * @param {Object} config object containing sensor configuration
 * @param {ROSLIB.Ros} ros ros instance to publish to
 * @return {Map} map containing all sensors with their respective publisher
 */
function readSensorsFromConfig(config, ros) {
  const sensorMap = new Map();

  // loop through all publishable sensor types, e.g. imu or compass
  // (see sensorDeserializers array)
  for (const sensorType of Object.keys(sensorDeserializers)) {
    const sensorInstances = config[sensorType];

    // check if no instances of the sensor type present in config
    if (!sensorInstances) {
      continue;
    }

    // loop through all instances, and publish them
    for (const instanceProperties of Object.values(sensorInstances)) {
      const sensorInitializer = sensorDeserializers[sensorType];
      const sensorPublisher = sensorInitializer(ros, instanceProperties);
      sensorMap.set(sensorPublisher.topic.name, sensorPublisher);
    }
  }
  return sensorMap;
}


module.exports = {
  readSensorsFromConfig: readSensorsFromConfig,
};
