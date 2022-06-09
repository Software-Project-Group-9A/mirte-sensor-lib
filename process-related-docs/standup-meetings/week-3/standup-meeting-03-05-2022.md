# Stand-up Meeting 
Date: Tuesday, 03-05-2022 
#### Points to be discussed
- covariance in ImuMessage
- What to do if DeviceMotion doesn't work?
- IOS request permission
- Opinion: constructor should not instantly also start publishing. 
- setFrequency is niet logish als hij meteen begint.
- Do we want `setPublishFrequency(hz)` to restart timer? as this might be counter intuitive in use (maybe rename). There also might be usecases which want to update the frequency and wait with restarting.
- What to do with outside libraries? (quaternion)

#### Notes
Pieter:
	Walked into:            writing tests for HTML was kind of hard to figure out, but it works now. 
	Going to work on:   last tests for slider publisher, introduction for TW.

Anish:
	Walked into:           Cam Publisher needs canvas -> do further research. 
	Going to work on:   use updater that captures videos in snippets. 

Tijs:
	Walked into:            Style checker didn't work correctly, so added ESLint.
	Going to work on:   Figure out how to use Mirte and remain internet connection, work on text label publisher task. 

Mike:
	Walked into:            Request permission is hard to test -> comment out and retry writing tests.  Can't really test permission -> figure out later.
	Going to work on:  Try to finish Magnetic Declination tests and make MR   
	
Gijs:
	Walked into:             
	Going to work on:    

From now on:
For things that need to be done in the future make a GitLab issue.