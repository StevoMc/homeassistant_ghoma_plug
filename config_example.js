var config = require("./config");
var gHomaAddress = "192.168.178.102"; // IP address of g-homa plug
var controlServer = "192.168.178.99"; // Your server address
var controlPort = 4196;

config.configure(
  gHomaAddress,
  controlServer,
  controlPort,
  function (err) {
    console.log(err ? "Error: " + err : "Success");
  } /*, console.log */
);

/*
 //Restore default config of the plug
 config.restore(gHomaAddress, function (err) {
 console.log(err ? 'Error: ' + err : 'Success');
 }, console.log);
 */
