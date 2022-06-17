/**
 * This file tells @function require what to import when requiring the entire sensors folder.
 *
 * Any module to be exported to the library should have an entry in the object below.
 */
module.exports = {
  AmbientLightPublisher: require('./AmbientLightPublisher'),
  ButtonPublisher: require('./ButtonPublisher'),
  CameraPublisher: require('./CameraPublisher'),
  CheckboxPublisher: require('./CheckboxPublisher'),
  CompassPublisher: require('./CompassPublisher'),
  CoordinateCompassPublisher: require('./CoordinateCompassPublisher'),
  GPSPublisher: require('./GPSPublisher'),
  IMUPublisher: require('./IMUPublisher'),
  SliderPublisher: require('./SliderPublisher'),
  TextPublisher: require('./TextPublisher'),
};
