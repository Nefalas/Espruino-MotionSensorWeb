// ### Variables ###

var motionSensorPin     = A6;
var ledPin              = A5;

var motion              = false;
var motionTriggerActive = false;

var ssid                = "evothings-airport";
var pass                = "evothings";

var date;
var Clock               = require("clock").Clock;
var clk                 = new Clock();

var htmlResponse        = "";

var motion1             = "";
var motion2             = "";
var motion3             = "";


// ### Functions ###

function setupServer() {
  var http = require("http");
  var httpServer = http.createServer(function(request, response) {
    console.log("==================");
    console.log("Received request");
    console.log(request);
    console.log("==================");
    if (request.url == "/favicon.ico") {
      response.writeHead(404);
      response.end("");
      return;
    }
    response.write("<html><body>");
    response.write(htmlResponse);
    response.end("</body></html>");
  });
  httpServer.listen(80);
  console.log("Server online");
}

function connectToWifi() {
  digitalWrite(B9, true);
  Serial2.setup(9600, {rx: A3, tx: A2});
  console.log("==================");
  console.log("Connecting to WiFi");
  var wifi = require("ESP8266WiFi").connect(Serial2, function(err) {
    if (err) throw err;
    wifi.reset(function(err) {
      if (err) throw err;
      wifi.connect(ssid, pass, function(err) {
        if (err) throw err;
        wifi.getIP(function(err, ip) {
          console.log("Connected to Wifi: " + ssid + " with IP: " + ip);
          setupServer();
          setTime();
          setInterval(setTime, 60000 * 5);
        });
      });
    });
  });
}

function saveMotion(motion) {
  motion3 = motion2;
  motion2 = motion1;
  motion1 = motion;
  htmlResponse = motion1 + "<br/>" + motion2 + "<br/>" + motion3;
}

function motionDetected() {
  var d = clk.getDate().toString().replace(" GMT+0000", "");
  console.log("==================");
  var motion = "Motion detected on " + d;
  saveMotion(motion);
  console.log(motion);
  console.log("Turning on LED");
  digitalWrite(ledPin, true);
}

function motionEnd() {
  console.log("Turning off LED");
  console.log("==================");
  digitalWrite(ledPin, false);
}

function setTime() {
  require("http").get("http://www.timeapi.org/utc/now", function(res) {
    console.log("Fetching date");
    console.log("==================");
    date = Date.parse(res.headers.Date);
    clk.setClock(date + 7200000); //Date + 2 hours
    motionTriggerActive = true;
  });
}


// ### Code ###

E.on('init', function() {
  connectToWifi();
});

setWatch(function() {
  if (motionTriggerActive) {
    motion = true;
    motionDetected();
    setTimeout(function() {
      motionEnd();
      active = motion;
    }, 2000);
  }
}, motionSensorPin, {repeat: true, edge: "rising"});