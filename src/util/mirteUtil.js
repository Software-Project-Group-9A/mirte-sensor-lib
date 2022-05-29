const IMUPublisher = require('../sensors/IMUPublisher');
const MagneticDeclinationPublisher = require('../sensors/MagneticDeclinationPublisher');

const sensorTypes = ['remote_imu', 'remote_magnetic_declination'];
/**
 * Array containing initializers for every type of sensor.
 * An initializer is a function that takes a properties object and ros instance,
 * and returns the corresponding SensorPublisher.
 */
const sensorInitializers = {
  'remote_imu': (properties, ros) => initializeIntervalPublisher(properties, IMUPublisher, ros),
  'remote_magnetic_declination': (properties, ros) =>
    initializeIntervalPublisher(properties, MagneticDeclinationPublisher, ros),
};

/**
 *
 * @param {*} properties
 * @param {*} constructor
 * @param {*} ros
 * @return {SensorPublisher}
 */
function initializeIntervalPublisher(properties, constructor, ros) {
  const topic = new ROSLIB.Topic({
    ros: ros,
    name: properties.name,
    messageType: 'sensor_msgs/IMU',
  });

  const publisher = new constructor(topic);
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
  for (const sensorType of sensorTypes) {
    const sensorInstances = params[sensorType];

    // check if no instances of the sensor type present in config
    if (!sensorInstances) {
      continue;
    }

    // loop through all instances, and publish them
    for (const [instanceName, instanceProperties] of Object.entries(sensorInstances)) {
      const sensorInitializer = sensorInitializers[sensorType];
      const sensorPublisher = sensorInitializer(instanceProperties, ros);
      sensorMap.set(instanceName, sensorPublisher);
    }
  }
  return sensorMap;
}


module.exports = {
  readSensorsFromConfig: readSensorsFromConfig,
};
