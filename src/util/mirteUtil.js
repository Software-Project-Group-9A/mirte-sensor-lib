const GPSPublisher = require('../sensors/GPSPublisher');
const IMUPublisher = require('../sensors/IMUPublisher');
const MagneticDeclinationPublisher = require('../sensors/MagneticDeclinationPublisher');
const GPSDeclinationPublisher = require('../sensors/GPSDeclinationPublisher');
const CameraPublisher = require('../sensors/CameraPublisher');

/**
 * Array containing initializers for every type of sensor.
 * An initializer is a function that takes a ros instance and a properties object,
 * and returns the corresponding SensorPublisher.
 */
const sensorInitializers = {
  'remote_imu': IMUPublisher.readFromConfig,
  'remote_magnetic_declination': MagneticDeclinationPublisher.readFromConfig,
  'remote_gps': GPSPublisher.readFromConfig,
  'remote_gps_declination': GPSDeclinationPublisher.readFromConfig,
  'remote_camera': CameraPublisher.readFromConfig,
};

/**
 *
 * @param {*} properties
 * @param {*} constructor
 * @param {*} ros
 * @return {SensorPublisher}
 */
function initializeIntervalPublisher(properties, constructor, ros) {
  const publisher = new constructor(ros, properties.name);
  publisher.start();
  publisher.setPublishFrequency(properties.frequency);

  return publisher;
}

/**
 * Reads the mirte ROS parameters and publishes sensors as indicated
 * in the mirte parameters.
 * @param {*} params
 * @param {ROSLIB.Ros} ros
 * @return {Map} map containing all sensors with their respective publisher
 */
function readSensorsFromConfig(params, ros) {
  const sensorMap = new Map();

  // loop through all publishable sensor types, e.g. imu or magnetic_declination
  // (see sensorTypes array)
  for (const sensorType of Object.keys(sensorInitializers)) {
    const sensorInstances = params[sensorType];

    // check if no instances of the sensor type present in config
    if (!sensorInstances) {
      continue;
    }

    // loop through all instances, and publish them
    for (const [instanceName, instanceProperties] of Object.entries(sensorInstances)) {
      const sensorInitializer = sensorInitializers[sensorType];
      const sensorPublisher = sensorInitializer(ros, instanceProperties);
      sensorMap.set(instanceName, sensorPublisher);
    }
  }
  return sensorMap;
}


module.exports = {
  readSensorsFromConfig: readSensorsFromConfig,
};
