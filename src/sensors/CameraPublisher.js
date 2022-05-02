var ROSLIB = require('roslib');
const SensorPublisher = require("./SensorPublisher");

/**
 * Template for object that publishes sensor data to the provided ROS topic.
 */
class CameraPublisher{
    /**
     * Creates a new sensor publisher that publishes to the provided topic.
     * @param {Topic} topic a Topic from RosLibJS
     */
    constructor(topic, devices) {
        if(!typeof (topic) == ROSLIB.Topic){
            this.onError(TypeError)
        }

        var self = this
        this.topic = topic
        this.cameras = []
        navigator.mediaDevices.enumerateDevices().then(devices => {
            cameras.push(devices.filter((device) => device.kind === 'videoinput'));

          });
          console.log(inputs.length)
          document.getElementById("light").innerHTML = `${inputs.length} and first one is ${inputs[0]}`
          console.log(inputs[0])
        this.start()
    }

    /**
     * Callback for when error occurs while reading sensor data.
     * @param {*} error containing error info.
     */
    onError(error) {
        console.log("CameraError: "+error)
        throw new error;
    }

    /**
     * Callback for reading sensor data.
     * Should publish data to ROS topic.
     * @param {*} event object containing sensor data.
     */
    onReadData(event) {
        this.cameraInputs = []
        event.enumerateDevices().then(devices => {
            devices.forEach(device => {
                if (device.kind === "videoinput"){
                    cameraInputs.push({id: device.deviceId, label: device.label})
                }
            });
        })
        console.log(cameraInputs);
        
    }

    /**
     * Start the publishing of data to ROS.
     */
    start() {
        this.topic.subscribe()
    }

    /**
     * Stops the publishing of data to ROS.
     */
    stop() {
        this.topic.unsubscribe();
    }

    /**
     * Sets the maximum frequency at which new data can be published.
     */
    setPublishFrequency() {
        throw 'setPublishFrequency method not defined!';
    }
}

module.exports = SensorPublisher;