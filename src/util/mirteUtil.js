const GPSPublisher = require('../sensors/GPSPublisher');
const IMUPublisher = require('../sensors/IMUPublisher');
const MagneticDeclinationPublisher = require('../sensors/MagneticDeclinationPublisher');
const GPSDeclinationPublisher = require('../sensors/GPSDeclinationPublisher');
const CameraPublisher = require('../sensors/CameraPublisher');
// HTML element publishers
const SliderPublisher = require('../sensors/SliderPublisher');
const ButtonPublisher = require('../sensors/ButtonPublisher');
const TextPublisher = require('../sensors/TextPublisher');
const CheckboxPublisher = require('../sensors/CheckBoxPublisher');
/**
 * Array containing deserializers for every type of sensor.
 * An deserializers is a function that takes a ros instance and a properties object,
 * and returns the corresponding SensorPublisher.
 */
const sensorDeserializers = {
  'phone_imu': IMUPublisher.readFromConfig,
  'phone_magnetic_declination': MagneticDeclinationPublisher.readFromConfig,
  'phone_gps': GPSPublisher.readFromConfig,
  'phone_gps_declination': GPSDeclinationPublisher.readFromConfig,
  'phone_camera': CameraPublisher.readFromConfig,
  'phone_slider': SliderPublisher.readFromConfig,
  'phone_button': ButtonPublisher.readFromConfig,
  'phone_text_input': TextPublisher.readFromConfig,
  'phone_checkbox': CheckboxPublisher.readFromConfig,
};

/**
 * Reads the mirte ROS parameters and publishes sensors as indicated
 * in the mirte parameters.
 * @param {Object} config object containing sensor configuration
 * @param {ROSLIB.Ros} ros ros instance to publish to
 * @param {HTMLElement} targetElement HTML element in which to generate necessary sensor UI elements
 * @return {Map} map containing all sensors with their respective publisher
 */
function readSensorsFromConfig(config, ros, targetElement) {
  const sensorMap = new Map();

  // loop through all publishable sensor types, e.g. imu or magnetic_declination
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
      const sensorPublisher = sensorInitializer(ros, instanceProperties, targetElement);
      sensorMap.set(sensorPublisher.topic.name, sensorPublisher);
    }
  }
  return sensorMap;
}


module.exports = {
  readSensorsFromConfig: readSensorsFromConfig,
};
