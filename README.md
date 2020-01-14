# node-appletv-x

> A node module for interacting with an Apple TV (4th-generation or later) over the Media Remote Protocol.

[![License][license-image]][license-url]

![](images/pairing.gif)

## Disclaimer

Original project by [@edc1591](https://twitter.com/edc1591).
Code includes some fixes made by: [GioCirque](https://github.com/GioCirque/node-appletv), [casey-chow](https://github.com/casey-chow/node-appletv) and [SeppSTA](https://github.com/SeppSTA/node-appletv)
The code delivered AS-IS, due to lack of time I am not planning to provide any support, feel free to do with it whatever you want. :)

## Overview

`node-appletv-x` is a `node.js` implementation of the Media Remote Protocol which shipped with the 4th-generation Apple TV. This is the protocol that the Apple TV remote app uses, so this should enable the creation of an Apple TV remote app for various platforms. It can also be used in a `homebridge` plugin to connect Apple TV events to HomeKit and vice versa. `node-appletv-x` can be used as a standalone command line application, or as a module in your own node app. Keep reading for installation and usage instructions.

This version adding following funtionality:
* Works with latest NodeJS (v12.x and newer) & Modules.
* Fix duplicate AppleTV entries
* Additinal buttons are added: select, tv, longtv
* Support for tvOS 13.3 and newer
* Various fixes

## Documentation

Developer documentation for `node-appletv-x` can be found /docs/ folder.

## Usage

### As a standalone cli

```bash
# Install
$ sudo apt-get install libtool autoconf automake libavahi-compat-libdnssd-dev
$ sudo npm install -g node-appletv-x --unsafe-perm

# Display built-in help
$ appletv --help
```

The `appletv` cli supports several commands, such as:

`pair`: Scans for Apple TVs on the local network and initiates the pairing process

`command <command>`: Execute a command on an Apple TV (play, pause, menu, etc.)
Example: `appletv --credentials '<your_pairing_token>' command tv`

`state`: Logs state changes from an Apple TV (now playing info)

`queue`: Requests the current playback queue from an Apple TV

`messages`: Logs all raw messages from an Apple TV

`help <command>`: Get help for a specific command


### As a node module

```bash
$ npm install --save node-appletv-x
```

`node-appletv-x` makes heavy use of Promises. All functions, except for the observe functions, return Promises.

### Examples

#### Scan for Apple TVs and pair

```typescript
import { scan } from 'node-appletv';

return scan()
    .then(devices => {
    	// devices is an array of AppleTV objects
    	let device = devices[0];
    	return device.openConnection()
    		.then(device => {
    			return device.pair();
    		})
    		.then(callback => {
    			// the pin is provided onscreen from the Apple TV
    			return callback(pin);
    		});
    })
    .then(device => {
    	// you're paired!
    	let credentials = device.credentials.toString();
    	console.log(credentials);
    })
    .catch(error => {
    	console.log(error);
    });
```

#### Connect to a paired Apple TV

```typescript
import { scan, parseCredentials, NowPlayingInfo } from 'node-appletv';

// see example above for how to get the credentials string
let credentials = parseCredentials(credentialsString);

return scan(uniqueIdentifier)
    .then(devices => {
    	let device = devices[0];
    	return device.openConnection(credentials);
    })
    .then(device => {
    	// you're connected!
    	// press menu
    	return device.sendKeyCommand(AppleTV.Key.Menu);
    })
    .then(device => {
    	console.log("Sent a menu command!");
    	
    	// monitor now playing info
    	device.on('nowPlaying', (info: NowPlayingInfo) => {
    		console.log(info.toString());
    	});
    })
    .catch(error => {
    	console.log(error);
    });
```

The `uniqueIdentifier` is advertised by each Apple TV via Bonjour. Use an app like [Bonjour Browser](http://www.tildesoft.com) to find it. The identifier is also the first value in the string value of the `Credentials` object.

See [homebridge-theater-mode](https://github.com/edc1591/homebridge-theater-mode) for a more practical use of this module.

## Acknowledgments

`node-appletv-x` would not have been possible without the work of these people:

* [Jean Regisser](https://github.com/jeanregisser) who reversed the protobuf [spec of the MediaRemoteTV protocol](https://github.com/jeanregisser/mediaremotetv-protocol)
* [Pierre Ståhl](https://github.com/postlund) who [implemented the protocol in Python](https://github.com/postlund/pyatv)
* [Khaos Tian](https://github.com/KhaosT) for [reversing the HomeKit protocol](https://github.com/KhaosT/HAP-NodeJS) which also uses SRP encryption
* [Zach Bean](https://github.com/forty2) for [implementing the HAP client spec](https://github.com/forty2/hap-client)

## Meta

Distributed under the MIT license. See ``LICENSE`` for more information.

[license-image]: https://img.shields.io/badge/License-MIT-blue.svg
[license-url]: LICENSE