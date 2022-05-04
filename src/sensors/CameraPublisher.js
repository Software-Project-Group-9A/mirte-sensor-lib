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
    constructor(topic, camera) {
        
        super(topic);
        
        var self = this;
        this.topic = topic;
        this.camera = camera;
        // this.capture = capture;
        if(!this.camera || !this.capture){
            this.onError(new Error());
        }

        this.frequency = 0;
        this.cameraTimer = null;
        this.stream = null;
    
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
        // this.cameras = this.cameras
        //     .filter((device) => device.kind === 'videoinput')
        //     .map((device) => device.toJSON);

    }

    /**
     * Create a snapshot of the current videostream.
     * 
     * Resource used: https://web.dev/requestvideoframecallback-rvfc/
     */
    takepicture() {
        var width = 640;
        var height = this.video.videoHeight / (this.video.videoWidth/width);

        this.canvas.width = width;
        this.canvas.height = height;

        if(video.crossOrigin !== "anonymous") {
            video.crossOrigin = "anonymous"
        }

        this.canvas.getContext('2d').drawImage(this.stream, 0, 0, width, height);
    
        var data = canvas.toDataURL('image/jpeg');
        var imageMessage = new ROSLIB.Message({
            format : 'jpeg',
            data : data.replace('data:image/jpeg;base64,', '')
        });
        console.log(imageMessage)
        this.topic.publish(imageMessage)

    }
    /**
     * Start the publishing of data to ROS.
     * 
     * Resource used: http://wiki.ros.org/roslibjs/Tutorials/Publishing%20video%20and%20IMU%20data%20with%20roslibjs
     */
    start() {
        navigator.getMedia(
            {
              video: {deviceId: this.camera.deviceId},
              audio: false
            },
            function(stream) {
              this.stream = stream;
            },
            function(err) {
              console.log('An error occured! ' + err);
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