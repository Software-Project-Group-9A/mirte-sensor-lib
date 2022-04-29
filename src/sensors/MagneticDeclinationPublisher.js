 let compass;
 
 function isIOS() {
    return [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform)
    // iPad on iOS 13 detection
    || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  }

  let pointDegree;

function locationHandler(position) {
  const { latitude, longitude } = position.coords;
  pointDegree = calcDegreeToPoint(latitude, longitude);

  if (pointDegree < 0) {
    pointDegree = pointDegree + 360;
  }
}

function calcDegreeToPoint(latitude, longitude) {
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

 class MagneticDeclinationPublisher {
    /**
     * Creates a new sensor publisher that publishes to the provided topic.
     * @param {Topic} topic a Topic from RosLibJS
     */
    constructor(topic) {
        this.topic = topic;
        navigator.geolocation.getCurrentPosition(locationHandler);
    }

    /**
     * Callback for when error occurs while reading sensor data.
     * @param {*} event containing error info.
     */
    onError(event) {
        throw 'ERROR';
    }

    /**
     * Callback for reading sensor data.
     * Should publish data to ROS topic.
     * @param {*} event object containing sensor data.
     */
    onReadData(event) {
        compass = e.webkitCompassHeading || Math.abs(e.alpha - 360);
        compassCircle.style.transform = `translate(-50%, -50%) rotate(${-compass}deg)`;

        // ±15 degree
        if (
            (pointDegree < Math.abs(compass) && pointDegree + 15 > Math.abs(compass)) ||
            pointDegree > Math.abs(compass + 15) ||
            pointDegree < Math.abs(compass)
        ) {
            myPoint.style.opacity = 0;
        } else if (pointDegree) {
            myPoint.style.opacity = 1;
        }
    }

    /**
     * Start the publishing of data to ROS.
     */
    start() {
        if (isIOS) {
            DeviceOrientationEvent.requestPermission()
              .then((response) => {
                if (response === "granted") {
                  window.addEventListener("deviceorientation", handler, true);
                } else {
                  alert("has to be allowed!");
                }
              })
              .catch(() => alert("not supported"));
          } else {
            window.addEventListener("deviceorientationabsolute", handler, true);
          }
    }

    /**
     * Stops the publishing of data to ROS.
     */
    stop() {
        throw 'stop method not defined!';
    }

    /**
     * Sets the maximum frequency at which new data can be published.
     */
    setPublishFrequency() {
        throw 'setPublishFrequency method not defined!';
    }
}

module.exports = MagneticDeclinationPublisher;