# Mirte Sensor Library

## About 

The Mirte Sensor Library is JavaScript library for getting sensor data of a mobile phone and sending this data to a ROS instance. This is done through a webpage on the mobile phone.

It currently offers support for publishing data from the following sensors:
- Inertial Measurement Unit(IMU)
- GPS
- Compass (to magnetic north or to a specific coordinate)
- Camera
- Ambient light sensor 

Additionally, it allows for publishing the state of certain HTML UI elements to ROS. These elements include but are not limited to:
- Text input box
- Slider
- Checkbox

Lastly, the library allows a ROS instance to send data to a mobile phone by having a webpage subscribe to a ROS topic. This currently supports the following:
- Flashlight: The flashlight of a phone can be turned on or off.
- Image: Images sent by a ROS instance can be displayed.
- Text: Text sent by a ROS instance can be displayed.

A detailed documentation of the library can be found through `/doc/index.html`
## Dependencies

This library depends on [roslibjs](https://github.com/RobotWebTools/roslibjs "RosLibJs")

To allow the library to function correctly, these dependencies must already be loaded before importing the Mirte Sensor Library.

## How To Use

To use Mirte Sensor Library, it must be imbedded as a script in a webpage. Please make sure the necessary dependencies are already imported, before adding the Mirte Sensor Library. This can be done as follows:

```html
<script src="http://static.robotwebtools.org/roslibjs/current/roslib.min.js"></script>
<script src="/path/to/RosSensorLib.min.js"></script>
```

A pre-built file of the library can be found in the */build* folder of this repository. Alternatively, the  files can be built from scratch using the commands below. For more information regarding the tools of this project, see [Running the tools](#running-the-tools).

Once Mirte Sensor Library has been imported, it functionality is exposed through the global ```SENSORLIB``` object.
From this object, it is possible to create a number of different ```SensorPublishers```, to share the data of a specific sensor to ROS. These ```SensorPublishers``` require a ROS instance and a topic name to publish to.  The ROS handle can be created through the roslibjs library, by connecting to a running ROS instance. An example piece of code can be seen below, where a ```ButtonPublisher``` is setup to publish the state of an HTML button to a local ROS instance.

```js
var ros = new ROSLIB.Ros();
ros.connect('ws://localhost:9090');

var publisher = new SENSORLIB.ButtonPublisher(ros, "/topic", document.getElementById("button"));
publisher.start();
```

The details for how to create and use the different ```SensorPublishers``` can be found in the documentation. 

A number of example for how to do this can be found in the ```/examples``` folder.

Please note that the ```SensorPublishers``` require a secure http connection (https) to publish the sensor data. 

## Documentation
Currently, the documentation of Mirte Sensor Library is only available to generating it youself from the source code.
See *running the tools* for more details.

## Setup

*Note: Requires npm to be installed on your device.*

To setup the project, run the following commands:
```
npm install -g grunt-cli  
npm install .
```

## Running the tools



### **To build**
```
grunt build
```
This will create a ``` RosSensorLib.js``` and a ``` RosSensorLib.min.js``` in the /build folder
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
