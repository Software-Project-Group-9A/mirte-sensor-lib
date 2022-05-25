/**
 * Reads the mirte ROS parameters and publishes sensors as indicated
 * in the mirte parameters.
 * @param {*} params
 */
function readSensorsFromConfig(params) {
  // imu sensors
  const imuSensors = params['remote_imu'];

  if (!imuSensors) {
    return;
  }

  for (const [instanceName, instanceProperties] of Object.entries(p)) {
    const topic = new ROSLIB.Topic({
      ros: ros,
      name: instanceName,
      messageType: 'sensor_msgs/IMU',
    });

    const publisher = new SENSORLIB.IMUPublisher(topic);
    publisher.start();
    publisher.setPublishFrequency(instanceProperties.frequency);
  }
}


module.exports = readSensorsFromConfig;
