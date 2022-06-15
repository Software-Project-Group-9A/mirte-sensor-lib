#Client meeting week 4:
##Short demo of sensor library --> Use RVIZ
    * Button
    * IMU 
    * Compass
    * Rest didn't show because this was inrelevant 
##How to push and pull from Mirte 
    --> Forken en copy at the end
    --> Connect Mirte and laptop both with internet via hotspot
    --> connecting Mirte with other network is in docs, 'Connecting Mirte to your own WiFi'
    --> Can fail a lot, keep trying

##In yaml file all hardware is defined
    --> Script checks availlable sensors
    --> Put all sensors with their fields (freq, loc, ...) in the yaml file

##Default freq research is nice form of research
    --> In settings you can add sensors who get automatically added to the yaml file
    --> Don't allow users to change frequency 

##Each button/slider has automatically it's own topic

##Automatic ROS connection 
    --> With only our library it should check if there are buttons/sliders in the HTML
        --> Do this in new library to still have general open source library
##Web-interface
    --> New URL for sensors
    --> Blockly < Python < ROS
    --> Python checks yaml file and sees what methods it should make (robot.py)
    --> Works via ROS1
    --> Blockly block calls python method (web-interface/view.js/content/source/modules/blockly)
    --> web-interface/view.js/content/source/sensors communicates with ROS and checks yaml
##HTML learner
    --> new tab for HTML
    --> only HTML is good, no extra abstraction needed
        --> Automtically include all the scripts
        --> Overrulles yaml