// ### Variables ###

var motionSensorPin = A6;
var ledPin          = A5;

var active          = false;

var ssid = "evothings-airport";
var pass = "evothings";

var date;
var Clock = require("clock").Clock;
var clk = new Clock();


// ### Functions ###

function connectToWifi() {
  digitalWrite(B9, true);
  Serial2.setup(9600, {rx: A3, tx: A2});
  console.log("Connecting to WiFi");
  var wifi = require("ESP8266WiFi").connect(Serial2, function(err) {
    if (err) throw err;
    wifi.reset(function(err) {
      if (err) throw err;
      wifi.connect(ssid, pass, function(err) {
        if (err) throw err;
        wifi.getIP(function(err, ip) {
          console.log("Connected to Wifi: " + ssid + " with IP: " + ip);
        });
        getTime();
      });
    });
  });
}

function getTime() {
  require("http").get("http://www.timeapi.org/utc/now", function(res) {
          clk.setClock(Date.parse(res.headers.Date) + 7200000);
  });
}

function motionDetected() {
  console.log("Motion detected on " + clk.getDate().toString());
  console.log("Turning on LED");
  digitalWrite(ledPin, true);
}

function motionEnd() {
  console.log("Turning off LED");
  digitalWrite(ledPin, false);
}


// ### Code ###

E.on('init', connectToWifi);

setWatch(function() {
  if (!active) {
    active = true;
    motionDetected();
    setTimeout(function() {
      motionEnd();
      active = false;
    }, 2000);
  }
}, motionSensorPin, {repeat: true, edge: "rising"});