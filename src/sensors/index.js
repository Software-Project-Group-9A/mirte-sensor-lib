/**
 * This file tells @function require what to import when requiring the entire sensors folder.
 *
 * Any module to be exported to the library should have an entry in the object below.
 */
module.exports = {
  SliderPublisher: require('./SliderPublisher'),
  ButtonPublisher: require('./ButtonPublisher'),
  CameraPublisher: require('./CameraPublisher'),
  TextPublisher: require('./TextPublisher'),
  GPSPublisher: require('./GPSPublisher'),
  MagneticDeclinationPublisher: require('./MagneticDeclinationPublisher'),
};
