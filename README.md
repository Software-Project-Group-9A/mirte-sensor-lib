# Mirte Sensor Library

## About 

The Mirte Sensor Library is JavaScript library for getting the sensor data of a mobile phone into ROS.

It currently offers support for publishing IMU, GPS, compass and camera sensor data.

Additionally, it allows for publishing the state of certain HTML UI elements to ROS.

## Dependencies

The library has the following dependencies:

- eventemitter2: [https://github.com/EventEmitter2/EventEmitter2]
- roslibjs: [https://github.com/RobotWebTools/roslibjs]

To allow the library to function correctly, these dependencies must already be loaded before importing the Mirte Sensor Library.

## How To Use

To use Mirte Sensor Library, it must be imbedded as a script in a webpage. Please make sure the necessary dependencies are already imported, before adding the Mirte Sensor Library. This can be done as follows:
```
<script src="http://static.robotwebtools.org/EventEmitter2/current/eventemitter2.min.js"></script>
<script src="http://static.robotwebtools.org/roslibjs/current/roslib.min.js"></script>
<script src="/path/to/RosSensorLib.min.js"></script>
```

A pre-built file of the library can be found in the */build* folder of this repository. Alternatively, the  files can be built from scratch by running the ```grunt build``` command on your local machine. For more information regarding the tools of this project, see the *Running the tools* section of this file.

Once Mirte Sensor Library has been imported, it functionality is exposed through the global ```SENSORLIB``` object.
From this object, it is possible to create a number of different ```SensorPublisher```s, to share the data of a specific sensor to ROS. These ```SensorPublisher```s all require a Topic from roslibjs to function. In the options of the topic, you will need to specify the handle of the ROS instance to publish to, together with the name of the topic to publish to. The ROS handle can once again be created through the roslibjs library, by connecting to a running ROS instance. An example of this can be seen below, where a ```ButtonPublisher``` is setup to publish the state of an HTML button:

```
var ros = new ROSLIB.Ros();

ros.connect('ws://localhost:9090');

var topic = new ROSLIB.Topic({
    ros : ros,
    name : '/button'
});

var publisher = new SENSORLIB.ButtonPublisher(topic, document.getElementById("button"));
publisher.start();
```

The details for how to create and use the different ```SensorPublisher```s can be found in the documentation. 

A number of example for how to do this can be found in the ```/examples``` folder.

Please note that many of the ```SensorPublisher```s require user permission in order to start publishing their respective sensor data. If your browser throws a pop-up requesting permission to use one of your sensors, make sure to accept it.

## Documentation
Currently, the documentation of Mirte Sensor Library is only available to generating it youself from the source code.
See *running the tools* for more details.

## Setup

*Requires npm to be installed on your device.*

To setup the project, run the following commands:
```
npm install -g grunt-cli  
npm install .
```

## Running the tools



### **To build**
```
run: grunt build
```

### **To run tests**

**To run all tests:**
```  
grunt test  
```
*or*  
```
npm test 
```    

**To run all tests and track test coverage:** `
``` 
npm run coverage 
```

A report of the test coverage will be generated in build/report/nyc


### **To generate documentation**

run: 
```
grunt doc
``` 

The documentation will be generated in the ```/doc``` folder of the project.

## Authors and acknowledgment

| Picture | Name | Email |
|---|---|---|
| <img src="https://gitlab.ewi.tudelft.nl/uploads/-/system/user/avatar/3539/avatar.png?width=400" width="60"/> | Mike Segers | M.Segers-1@student.tudelft.nl |
| <img src="https://cdn.discordapp.com/attachments/965893530251845655/968054757249929246/unknown.png" width="60"/> | Tijs Lenssen | T.Lenssen@student.tudelft.nl |
| <img src="https://gitlab.ewi.tudelft.nl/uploads/-/system/user/avatar/2546/avatar.png?width=400" width="60"/> | Anish Jaggoe | A.S.H.Jaggoe@student.tudelft.nl |
| <img src="https://gitlab.ewi.tudelft.nl/uploads/-/system/user/avatar/3729/avatar.png?width=400" width="60"/> | Pieter Carton | P.A.Carton@student.tudelft.nl |
| <img src="https://gitlab.ewi.tudelft.nl/uploads/-/system/user/avatar/3096/avatar.png?width=400" width="60"/> | Gijs van de Linde | G.vandeLinde@student.tudelft.nl |
