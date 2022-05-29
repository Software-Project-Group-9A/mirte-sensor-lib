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
// Add errors
Object.assign(SENSORLIB, require('./error'));
// Add actuator components
Object.assign(SENSORLIB, require('./actuators'));
// Add util
Object.assign(SENSORLIB, require('./util'));

global.SENSORLIB = SENSORLIB;
