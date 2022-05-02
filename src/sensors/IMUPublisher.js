// Dependencies
var Quaternion = require('quaternion');
// var ROSLIB = require('roslib');
const SensorPublisher = require('./SensorPublisher.js');

// Important documentation
// http://docs.ros.org/en/lunar/api/sensor_msgs/html/msg/Imu.html
// 

// Great example used
// http://wiki.ros.org/roslibjs/Tutorials/Publishing%20video%20and%20IMU%20data%20with%20roslibjs

/**
 * Template for object that publishes sensor data to the provided ROS topic.
 */
class IMU extends SensorPublisher {  

    /**
     * Creates a new sensor publisher that publishes to the provided topic.
     * @param {Topic} topic a Topic from RosLibJS
     */
    constructor(topic) {
        // Super should have topic verification! @pcarton
        super(topic);
        
        var self = this;
        this.topic = topic;
        this.freq = 0.5;

        // First need to detect first device orientation.
        this.orientationReady = false;
        this.motionReady = false;

        // Enable callback for deviceOrientationEvent
        window.addEventListener('deviceorientation', (event) => {
            this.onReadOrientation(self, event);
        });
        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', (event) => {
                this.onReadMotion(self, event);
            });
        } else {
            window.alert('acceleration not supported!');
        }

        // start sensor
        // this.start();
        console.log('created!');        
    }

    /**
     * Callback for when error occurs while reading sensor data.
     * @param {*} event containing error info.
     */
    onError(event) {
        throw 'onError method not defined!';
    }

    /**
     * Callback for reading orientation data.
     * @param {IMU} self context of object that called callback.
     * @param {*} event object containing sensor data.
     */
     onReadOrientation(self, event) {
        self.alpha = event.alpha;
        self.beta = event.beta;
        self.gamma = event.gamma;
        self.orientationReady = true;
    }

    /**
     * Callback for reading motion data.
     * @param {IMU} self context of object that called callback.
     * @param {*} event object containing sensor data.
     */
     onReadMotion(self, event) {
        var rotation = event.rotationRate;
        var acceleration = event.acceleration;

        // acceleration
        self.x = acceleration.x;
        self.y = acceleration.y;
        self.z = acceleration.z;

        // rotation
        self.valpha = rotation.alpha;
        self.vbeta = rotation.beta;
        self.vgamma = rotation.gamma;

        self.motionReady = true;   
    }

    /**
     * 
     * 
     * Resource used: http://wiki.ros.org/roslibjs/Tutorials/Publishing%20video%20and%20IMU%20data%20with%20roslibjs
     */
    createSnapshot() {
        console.log('**SNAP**');
        if (!this.orientationReady || !this.motionReady) {
            throw 'snapShot was too early!';
        }
        // Convert rotation into quaternion.
        var alpha_rad = ((this.alpha + 360) / 360 * 2 * Math.PI) % (2 * Math.PI);
        var beta_rad = ((this.beta + 360) / 360 * 2 * Math.PI) % (2 * Math.PI);
        var gamma_rad = ((this.gamma + 360) / 360 * 2 * Math.PI) % (2 * Math.PI);
        var q = Quaternion.fromEuler(alpha_rad, beta_rad, gamma_rad, 'ZXY');

        var imuMessage = new ROSLIB.Message(
            {
                header: {
                    frame_id: 'imu_client'
                },
                orientation : {
                    x: q.x,
                    y: q.y,
                    z: q.z,
                    w: q.w
                },  
                orientation_covariance : [0,0,0,0,0,0,0,0,0],
                angular_velocity : {
                    x : this.vbeta,
                    y : this.vgamma,
                    z : this.valpha,
                },
                angular_velocity_covariance  : [0,0,0,0,0,0,0,0,0],
                linear_acceleration : {
                    x : this.x,
                    y : this.y,
                    z : this.z,
                },
                linear_acceleration_covariance  : [0,0,0,0,0,0,0,0,0]
            }
        );

        console.log(imuMessage);
        // this.topic.publish(imuMessage);
    }

    /**
     * Start the publishing of data to ROS with frequency of <freq> Hz.
     */
    start() {
        var delay = 1000/this.freq;
        this.timer = setInterval(() => {
            this.createSnapshot();
        }, delay);
    }

    /**
     * Stops the publishing of data to ROS.
     */
    stop() {
        clearInterval(this.timer);
    }

    /**
     * Sets the maximum frequency at which new data can be published.
     */
    setPublishFrequency(hz) {
        this.stop();
        this.freq = hz;
        this.start();
    }

}

module.exports = IMU;