/*
 Used sources:
    https://dev.to/orkhanjafarovr/real-compass-on-mobile-browsers-with-javascript-3emi
    https://answers.ros.org/question/65971/how-can-i-publish-an-integer-and-string-int16-string-using-roslibjs/
*/

// Dependencies
const SensorPublisher = require('./SensorPublisher.js');


let compass;
let pointDegree;

const isIOS = !(
  window.navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
  window.navigator.userAgent.match(/AppleWebKit/)
);

 class MagneticDeclinationPublisher extends SensorPublisher {
  /**
   * Creates a new sensor publisher that publishes to the provided topic.
   * @param {Topic} topic a Topic from RosLibJS
   */
  constructor(topic) {
    super(topic);

    var self = this;
    this.topic = topic;
    this.freq = 0.5;

    // First need to detect first device orientation.
    this.orientationReady = false;
    this.motionReady = false;

    if (isIOS) {
      window.DeviceOrientationEvent.requestPermission()
        .then((response) => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', (event) => {
              this.onReadOrientation(self, event);
            });  
            
            // start sensor
            this.start();
            console.log('started!');
          } else {
            alert('has to be allowed!');
          }
        })
        .catch(() => window.alert('not supported'));
    } else {
      window.addEventListener('deviceorientation', (event) => {
        this.onReadOrientation(self, event);
      });

      // start sensor
      this.start();
      console.log('started!');
    }
  }

  /**
   * Callback for when error occurs while reading sensor data.
   * @param {*} event containing error info.
   */
  onError(event) {
      throw 'ERROR!';
  }

  calcDegreeToPoint(latitude, longitude) {
    // Qibla geolocation
    const point = {
      lat: 21.422487,
      lng: 39.826206,
    };
  
    const phiK = (point.lat * Math.PI) / 180.0;
    const lambdaK = (point.lng * Math.PI) / 180.0;
    const phi = (latitude * Math.PI) / 180.0;
    const lambda = (longitude * Math.PI) / 180.0;
    const psi =
      (180.0 / Math.PI) *
      Math.atan2(
        Math.sin(lambdaK - lambda),
        Math.cos(phi) * Math.tan(phiK) -
          Math.sin(phi) * Math.cos(lambdaK - lambda)
      );
    return Math.round(psi);
  }

  locationHandler(position) {
    const { latitude, longitude } = position.coords;
    pointDegree = this.calcDegreeToPoint(latitude, longitude);
  
    if (pointDegree < 0) {
      pointDegree = pointDegree + 360;
    }
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

    window.navigator.geolocation.getCurrentPosition(this.locationHandler);
  }

  

  createSnapshot() {
    console.log('**SNAP**');
    compass = Math.abs(this.alpha - 360);

    var magneticDecilinationMessage = new ROSLIB.Message({
      data : compass
    });

    console.log(magneticDecilinationMessage);
    // this.topic.publish(magneticDecilinationMessage);

  }
  

  /**
   * Start the publishing of data to ROS.
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
    this.freq = hz;
    this.stop();
    this.start();
  }
}

module.exports = MagneticDeclinationPublisher;