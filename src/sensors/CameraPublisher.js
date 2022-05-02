var ROSLIB = require('roslib');
const SensorPublisher = require('./SensorPublisher');

//most template code from http://wiki.ros.org/roslibjs/Tutorials/Publishing%20video%20and%20IMU%20data%20with%20roslibjs
/**
 * Template for object that publishes sensor data to the provided ROS topic.
 */
class CameraPublisher extends SensorPublisher{
    /**
     * Creates a new Camera publisher that publishes to the provided topic.
     * @param {Topic} topic a Topic from RosLibJS
     */
    constructor(topic, devices) {
        
        super(topic);
        var self = this;
        
        this.topic = topic;
        this.cameras = devices;
        this.frequency = 0;
        this.cameraTimer = null;
        this.cameraSource = this.cameras[0];
        this.stream = null;
        
        this.start();
    }

    /**
     * Callback for when error occurs while reading sensor data.
     * @param {*} error containing error info.
     */
    onError(error) {
        console.log('CameraError: '+error);
        throw error;
    }

    /**
     * Callback for reading cameras.
     * @param {*} event object containing sensor data.
     */
    onReadData(event) {
        this.cameras = this.cameras
            .filter((device) => device.kind === 'videoinput')
            .map((device) => device.toJSON);
    }

    /**
     * Method for selecting a different camera input.
     * @param {*} source 
     */
    selectCamera(source) {
        this.cameraSource = source;
    }

    /**
     * Create a snapshot of the current videostream.
     */
    takepicture() {
        // canvas.width = width;
        // canvas.height = height;
    
        // canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);   
     
        var data = this.stream.toDataURL('image/jpeg');
        var imageMessage = new ROSLIB.Message({
            format : 'jpeg',
            data : data.replace('data:image/jpeg;base64,', '')
        });
    
        this.topic.publish(imageMessage);
    }
    /**
     * Start the publishing of data to ROS.
     */
    start() {
        navigator.getMedia(
            {
              video: {deviceId: this.cameraSource.deviceId},
              audio: false
            },
            function(stream) {
            //   cameraStream = stream;
              this.stream = stream;
            },
            function(err) {
              console.log('An error occured! ' + err);
            //   window.alert("An error occured! " + err);
            }
          );
        var delay = 1000/this.freq;
        this.cameraTimer = setInterval(function(){
            this.takepicture();
       }, delay); 
    }

    /**
     * Stops the publishing of data to ROS.
     */
    stop() {
        this.stream = null;
        this.takepicture();  
        this.topic.unsubscribe();
    }

    /**
     * Sets the maximum frequency at which new data can be published.
     */
    setPublishFrequency(hz) {
        this.frequency = hz;
        this.stop();
        this.start();
    }


}


module.exports = SensorPublisher;