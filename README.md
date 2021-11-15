A control server for G-Homa wifi plugs written in [node](http://nodejs.org).

This library enables the use of the wifi plugs without the need to allow them to call home.

This library is intended to be used as part of a home automatization solution. For example, it can be used together with a framework like [express.js](https://expressjs.com/) to switch the plugs on or off by simple http calls.

Installation
------------

```bash
$ npm install ghoma
```

Usage examples
--------------

This example shows the callback methods provided.

```js
var ghoma = require('./ghoma.js');

// Uncomment this line to get a detailed log output
// ghoma.log=console.log;

// Register a listener for new plugs
ghoma.onNew = function(plug) {
  console.log('Registerd    ' + plug.remoteAddress+" "+plug.id);
  // For this example switch the plug on in the moment it is registered.
  plug.on();
}

// Called when the plug switches on or off
ghoma.onStatusChange = function(plug) {
  console.log('New state of ' + plug.remoteAddress+' is '+plug.state+' triggered '+plug.triggered);
}

// Called when a enery measurement value was reported
ghoma.onMeasurement = function(plug, property) {
  console.log('Measured '+property+' at '+plug.remoteAddress+'. Value is '+plug.energy[property].value);
}

// Called when the plug connection to the server was lost
ghoma.onClose = function(plug) {
  console.log('Closed ' + plug.remoteAddress);
}

// Listen for heartbeats of the plugs
ghoma.onHeartbeat = function(plug) {
  console.log('Heartbeat ' + plug.remoteAddress);
}

// Start a listening server on this port
ghoma.startServer(4196);
```

Usage example to configure a plug to a custom server (or restore defaults) from code
```js
config.configure(gHomaPlugAddress, controlServer, controlPort, function (err) {
    console.log(err ? 'Error: ' + err : 'Success');
} /*, console.log to enabled debug log*/);


//Restore default config of the plug
config.restore(gHomaPlugAddress, function (err) {
    console.log(err ? 'Error: ' + err : 'Success');
}, console.log);
```

A more comprehensive example shows the node-ghoma library in combination with the express framework. See [express_example.js](https://github.com/rodney42/node-ghoma/blob/master/express_example.js) in the git repository.


API description
---------------

### Notifications
These notifications are triggered. See also example above.

#### onNew(plug)
Called when a new plug is registered with the control server.

#### onStatusChange(plug)
Called if the plug was switched on or off.

#### onMeasurement(plug, property)
Called if the plug has provided a new energy measurement. Only available for plugs with this capability. Property is the name of the measured energy velue.

#### onClose(plug)
Called if the connection to the plug was lost.

#### onHeartbeat(plug)
Called when a heartbeat event from the plug occurred.


### Methods
Methods provided by the module.

#### forEach(callback)
Iterate through each registered plug object. The callback will receive the plug object.

Example:

```js
ghoma.forEach(function(plug) {
  console.log('Plug with id '+plug.id+' at '+plug.remoteAddress+' has state '+plug.state);
});
```

#### get(id)
Helper method to get a plug by id. The id is the hex representation of the short mac of the plug. It can be used to unique identify the plug.

### The ghoma plug object

The plug object is used as callback argument for each notification and as a result of method calls.

```js
{
  id: "53ae11", // Unique ID of the plug. These are the last 3 bytes from the MAC address.
  firmware : "2.18.6"  // Plug firmware version
  state: "on",  // Current state. May be 'on','off' or 'unknown'
  statechanged: "2017-01-22T21:00:19.733Z", // Time of the last state change
  triggered: "local",  // local: Triggered by switch on the plug. remote: Triggered by control server
  prevstate: "off",   // The previous state. May be 'unkown', if the plug has no state send until now
  initalized: "2017-01-22T20:59:23.565Z", // Time the plug has registered with the control server
  remoteAddress: "::ffff:192.168.1.136", // The address of the plug
  remotePort: 14283, // The remote port
  heartbeat: "2017-01-22T21:00:20.893Z",  // Time of the last heartbeat call from the plug
  reregistered : 2, // Number of re registrations of the plug. May be a indicator for the connection stability
  on : // Function to switch the plug on
  off :  // Function to switch the plug off
  energy : {}  // Provided when using plugs with energy measurement funtionality (see below)
}
```

For plugs that provide energy measurement functionality (EMW302WF-CTL) there is also a energy object available, like :
```js
{
  energy: {
    voltage: {
      value: 220.1     // Current value
      prevvalue: 220.5 // Previous reported value
      count: 3         // Number of reportings
      update : "2017-01-22T21:02:21.591Z",  // Time of the last report for this value
    } 
    ...
  }
}
```
These measurement properties are provided.

| Name           | Description                                   |
|----------------|-----------------------------------------------|
| voltage        | Net voltage                                   |
| current        | Current                                       |
| frequency      | Net frequency                                 |
| cosphi         | Power factor                                  | 
| energy         | Enery usage in kWh added up                   |
| power          | Power value                                   |
| maxpower       | Maximum power                                 |

G-Homa installation
-------------------

With firmware version <=1.0.06 you can use the embedded web server to adjust the control server address. See the fhem wiki page for instructions.
With newer firmware version, this easy way to configure the plug is disabled.

One way to run your own control server is to setup your own DNS and DHCP service. Then the DNS entry for 'plug.g-homa.com' must point to your own server and you are forced to use '4196' as listening port.

Another way that may work for you is to use this node script to change the control server. See [config.js](https://github.com/rodney42/node-ghoma/blob/master/config.js).

Note: If you re-configure the plug to use the new control server, the android or ios app won't work any more.  

Change log
----------
* Version 1.1.0
  - Support for energy measurements. Inspired by the fhem module implementation.
  - Plug object contains the firmware version.
  
* Version 1.0.7 (thx to msteiger)
  - Typo fix: t(r)iggered. This may break current listeners that use this property.
  - Enhancement : express example return a plain state endpoint. The info endpoint returns all informations.
  - Fix: State unknown is not set, if the received command can not be processed.

* Version 1.0.6 (thx to jaumard)
  - The config.js can be used from another module.

* Version 1.0.5
  - Node.js minimum set to 1.5

* Version 1.0.4
  - Added reregistered property as count how often the node registered again with the control server.

* Version 1.0.3
  - Configuration tool config.js added.

* Version 1.0.2
  - Support for EMW302WFO IP44 added.
  - Filtered plug object is returned.

* Version 1.0.1
  - Enahancement: Logs, express example.
  - Removed not needed net dependency.

* Version 1.0.0
  - Fix: Handling of plugs that are reregistered.


Further information
-------------------

The network protocol was deciphered by others - full credits go to them.
See the [FHEM Wiki Page](http://www.fhemwiki.de/wiki/G-Homa) (german)
and
[Full disclosure for gHoma on seclists](http://seclists.org/fulldisclosure/2015/May/45) (german).

The hardware producer site can be found
[here](http://www.g-homa.com/index.php/de/) (also in german).