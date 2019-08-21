#!/usr/bin/env node

// ------------------ //
/// Alexa Skill section ///
// ------------------ //

var alexa = require('alexa-app');

// Allow this module to be reloaded by hotswap when changed
module.change_code = 1;

// Define an alexa-app with name that matches name on Alexa Skills Kit
var app = new alexa.app('publish-example');

app.launch(function(req, res) {
  console.log("publish-example: LaunchIntent");
  res.say("Launched publish example skill");
});

app.intent("tutleIntent", {
    "slots": {"NAME": "LITERAL", "DIRECTION": "LITERAL", "SPEED": "NUMBER"},
    "utterances": ["{names|NAME} go {direction| DIRECTION} at  {1-100| SPEED}"]
},  function(req, res) {
    console.log(JSON.stringify(req.data,null,3)); // look at the README.txt in node_modules/alexa_app
    console.log(req.slot("NAME"));
      var fast = req.slot("SPEED");
      var fast_float = parseFloat(fast);
      console.log('publish-example: PublishTwistIntent - publishing Twist...')
      // Create Twist message to publish, requires more work than just a std_msgs/String
      var twist = new ROSLIB.Message({
      // insert if statements for directions here 
      linear: {
        x: fast_float,
        y: 0.0,
        z: 0.0
      },
      angular: {
        x: 0.0,
        y: 0.0,
        z: 0.0
      }
  });
  // You can see this Twist message if you are running rostopic echo /cmd_vel
  turtle_cmd_vel_topic.publish(twist);
  console.log('publish-example: PublishTwistIntent - done publishing');
});

app.intent("sampleIntent", {
    "utterances": ["yeehaw"]
}, function(req, res) {
    console.log("hi-this sample");
    str_msg = new ROSLIB.Message({data: 'sampleIntent'})
    res.say('Hello Human');
    console.log('meemaw');
});

app.intent("PublishHelloIntent", {
  "utterances": ["Say hello"]
}, function(req, res) {
  // Log to console that the intent was received
  console.log(req);
  console.log("publish-example: PublishHelloIntent");
  // Do stuff with ROS using ROSLIB
  // You can see this String message if you are running rostopic echo /alexa_msgs
  str_msg  =new ROSLIB.Message({data: 'publish-example says hello'})
  console.log("str_msg created")
  msg_topic.publish(str_msg);
  console.log("msg sent");
  // Send a response back to the Echo for the voice interface
  res.say('Hello human');
  console.log('response sent');
});

app.intent("PublishGoodbyeIntent", {
  "utterances": ["Publish goodbye", "Say goodbye"]
}, function(req, res) {
  // Log to console that the intent was received
  console.log("publish-example: PublishGoodbyeIntent");
  // Do stuff with ROS using ROSLIB
  // You can see this String message if you are running rostopic echo /alexa_msgs
  str_msg  =new ROSLIB.Message({data: 'publish-example says goodbye'});
  msg_topic.publish(str_msg);
  // Send a response back to the Echo for the voice interface
  res.say('Goodbye human');
});

// NOTE: Be careful with this alexa skill intent!
// The cmd_vel topic is often used for robot platform movement, so either change
// the topic name defined below or be ready for suddent movements I guess
app.intent("PublishTwistIntent", {
  "utterances": ["Publish twist", "Send twist", "Command a twist"]
}, function(req, res) {
  console.log('publish-example: PublishTwistIntent - publishing Twist...')
  // Create Twist message to publish, requires more work than just a std_msgs/String
  var twist = new ROSLIB.Message({
    linear: {
      x: 0.1,
      y: 0.0,
      z: 0.0
    },
    angular: {
      x: 0.0,
      y: 0.0,
      z: 0.1
    }
  });
  // You can see this Twist message if you are running rostopic echo /cmd_vel
  cmd_vel_topic.publish(twist);
  console.log('publish-example: PublishTwistIntent - done publishing');
  // Send a response back to the Echo for the voice interface
  res.say('Published twist command');
});

// ------------------ //
/// ROS Interface section ///
// ------------------ //

// Connecting to ROS
var ROSLIB = require('roslib');
// rosbridge_websocket defaults to port 9090
var ros = new ROSLIB.Ros({url: 'ws://localhost:9090'});

ros.on('connection', function() {
  console.log('publish-example: Connected to websocket server.');
});

ros.on('error', function(error) {
  console.log('publish-example: Error connecting to websocket server: ', error);
});

ros.on('close', function() {
  console.log('publish-example: Connection to websocket server closed.');
});

// Setup a ROSLIB topic for each ROS topic you need to publish to
// publish Strings to /alexa_msgs and publish Twists to /cmd_vel
var msg_topic = new ROSLIB.Topic({ros: ros, name: '/alexa_msgs', messageType: 'std_msgs/String'});
// NOTE: The cmd_vel topic is often used for robot platform movement, change the
// topic name to like cmd_vel2 if you have a robot that you don't want moving
var turtle_cmd_vel_topic = new ROSLIB.Topic({ros: ros, name: '/turtle1/cmd_vel', messageType: 'geometry_msgs/Twist'});
var cmd_vel_topic = new ROSLIB.Topic({ros: ros, name: '/cmd_vel', messageType: 'geometry_msgs/Twist'});


// Export the alexa-app we created at the top
module.exports = app;
