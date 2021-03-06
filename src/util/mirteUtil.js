// Sensor Publishers
const CameraPublisher = require('../sensors/CameraPublisher');
const CoordinateCompassPublisher = require('../sensors/CoordinateCompassPublisher');
const GPSPublisher = require('../sensors/GPSPublisher');
const IMUPublisher = require('../sensors/IMUPublisher');
const CompassPublisher = require('../sensors/CompassPublisher');
// HTML element publishers
const ButtonPublisher = require('../sensors/ButtonPublisher');
const CheckboxPublisher = require('../sensors/CheckboxPublisher');
const SliderPublisher = require('../sensors/SliderPublisher');
const TextPublisher = require('../sensors/TextPublisher');
// Subscribers
const FlashLightSubscriber = require('../actuators/FlashlightSubscriber');
const ImageSubscriber = require('../actuators/ImageSubscriber');
const TextSubscriber = require('../actuators/TextSubscriber');

/**
 * Array containing deserializers for every type of sensor.
 * An deserializers is a function that takes a ros instance and a properties object,
 * and returns the corresponding SensorPublisher.
 */
const sensorDeserializers = {
  'phone_button': ButtonPublisher.readFromConfig,
  'phone_camera': CameraPublisher.readFromConfig,
  'phone_checkbox': CheckboxPublisher.readFromConfig,
  'phone_compass': CompassPublisher.readFromConfig,
  'phone_flashlight': FlashLightSubscriber.readFromConfig,
  'phone_gps': GPSPublisher.readFromConfig,
  'phone_image_output': ImageSubscriber.readFromConfig,
  'phone_imu': IMUPublisher.readFromConfig,
  'phone_coordinate_compass': CoordinateCompassPublisher.readFromConfig,
  'phone_slider': SliderPublisher.readFromConfig,
  'phone_text_input': TextPublisher.readFromConfig,
  'phone_text_output': TextSubscriber.readFromConfig,
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
      // tell the sensor initializers at which path the topic for the publisher should be generated
      instanceProperties.topicPath = '/mirte/' + sensorType;
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
