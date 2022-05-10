/**
 * If you use roslib in a browser, all the classes will be exported to a global
 * variable called SENSORLIB.
 *
 * If you use nodejs, this is the variable you get when you require('roslib')
 */
const SENSORLIB = this.SENSORLIB || {
  REVISION: '0.0.1',
};

// Add sensors components
Object.assign(SENSORLIB, require('./sensors'));
// Add actuator components
Object.assign(SENSORLIB, require('./actuators'));

global.SENSORLIB = SENSORLIB;
