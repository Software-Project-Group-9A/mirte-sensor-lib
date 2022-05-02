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
    
        window.addEventListener('camera', (event) => {
            this.onReadData(event);
        }).bind(this);
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
        // this.cameras = this.cameras
        //     .filter((device) => device.kind === 'videoinput')
        //     .map((device) => device.toJSON);

    }

    // /**
    //  * Method for selecting a different camera input.
    //  * @param {*} source 
    //  */
    // selectCamera(source) {
    //     this.cameraSource = source;
    // }

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
        let startTime = 0.0;

        const updateCanvas = (now, metadata) => {
            if (startTime === 0.0) {
              startTime = now;
            }
        
            this.canvas.getContext('2d').drawImage(this.stream, 0, 0, width, height);
        
            // const elapsed = (now - startTime) / 1000.0;
            // const fps = (++paintCount / elapsed).toFixed(3);
            // fpsInfo.innerText = !isFinite(fps) ? 0 : fps;
            // metadataInfo.innerText = JSON.stringify(metadata, null, 2);

            var data = this.canvas.toDataURL('image/jpeg');
            var imageMessage = new ROSLIB.Message({
                format : 'jpeg',
                data : data.replace('data:image/jpeg;base64,', '')
            });
            this.topic.publish(imageMessage);

            this.stream.requestVideoFrameCallback(updateCanvas);
        };
        this.stream.requestVideoFrameCallback(updateCanvas);

    }
    /**
     * Start the publishing of data to ROS.
     * 
     * Resource used: http://wiki.ros.org/roslibjs/Tutorials/Publishing%20video%20and%20IMU%20data%20with%20roslibjs
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