"use strict";
const caporal = require("caporal");
let cli = caporal;
const appletv_1 = require("../lib/appletv");
const credentials_1 = require("../lib/credentials");
const scan_1 = require("./scan");
const pair_1 = require("./pair");
cli
    .version('1.0.16')
    .command('pair', 'Pair with an Apple TV')
    .option('--timeout <timeout>', 'The amount of time (in seconds) to scan for Apple TVs', cli.INTEGER)
    .action((args, options, logger) => {
    scan_1.scan(logger, options.timeout)
        .then(device => {
        device.on('debug', (message) => {
            logger.debug(message);
        });
        device.on('error', (error) => {
            logger.error(error.message);
            logger.debug(error.stack);
        });
        return pair_1.pair(device, logger)
            .then(keys => {
            logger.info("Credentials: " + device.credentials.toString());
            process.exit();
        });
    })
        .catch(error => {
        logger.error(error.message);
        logger.debug(error.stack);
        process.exit();
    });
});
cli
    .command('command', 'Send a command to an Apple TV')
    .argument('<command>', 'The command to send', /^up|down|left|right|menu|play|pause|next|previous|suspend|select|tv|longtv$/)
    .option('--credentials <credentials>', 'The device credentials from pairing', cli.STRING)
    .action((args, options, logger) => {
    if (!options.credentials) {
        logger.error("Credentials are required. Pair first.");
        process.exit();
    }
    let credentials = credentials_1.Credentials.parse(options.credentials);
    scan_1.scan(logger, null, credentials.uniqueIdentifier)
        .then(device => {
        device.on('debug', (message) => {
            logger.debug(message);
        });
        device.on('error', (error) => {
            logger.error(error.message);
            logger.debug(error.stack);
        });
        return device
            .openConnection(credentials)
            .then(() => {
            return device
                .sendKeyCommand(appletv_1.AppleTV.key(args["command"]))
                .then(result => {
                logger.info("Success!");
                process.exit();
            });
        });
    })
        .catch(error => {
        logger.error(error.message);
        logger.debug(error.stack);
        process.exit();
    });
});
cli
    .command('state', 'Logs the playback state from the Apple TV')
    .option('--credentials <credentials>', 'The device credentials from pairing', cli.STRING)
    .action((args, options, logger) => {
    if (!options.credentials) {
        logger.error("Credentials are required. Pair first.");
        process.exit();
    }
    let credentials = credentials_1.Credentials.parse(options.credentials);
    scan_1.scan(logger, null, credentials.uniqueIdentifier)
        .then(device => {
        device.on('debug', (message) => {
            logger.debug(message);
        });
        device.on('error', (error) => {
            logger.error(error.message);
            logger.debug(error.stack);
        });
        return device
            .openConnection(credentials);
    })
        .then(device => {
        device.on('nowPlaying', (info) => {
            logger.info(info.toString());
        });
    })
        .catch(error => {
        logger.error(error.message);
        logger.debug(error.stack);
        process.exit();
    });
});
cli
    .command('queue', 'Request the playback state from the Apple TV')
    .option('--credentials <credentials>', 'The device credentials from pairing', cli.STRING)
    .option('--location <location>', 'The location in the queue', cli.INTEGER)
    .option('--length <length>', 'The length of the queue', cli.INTEGER)
    .option('--metadata', 'Include metadata', cli.BOOLEAN)
    .option('--lyrics', 'Include lyrics', cli.BOOLEAN)
    .option('--languages', 'Include language options', cli.BOOLEAN)
    .action((args, options, logger) => {
    if (!options.credentials) {
        logger.error("Credentials are required. Pair first.");
        process.exit();
    }
    let credentials = credentials_1.Credentials.parse(options.credentials);
    scan_1.scan(logger, null, credentials.uniqueIdentifier)
        .then(device => {
        device.on('debug', (message) => {
            logger.debug(message);
        });
        device.on('error', (error) => {
            logger.error(error.message);
            logger.debug(error.stack);
        });
        return device
            .openConnection(credentials);
    })
        .then(device => {
        return device
            .requestPlaybackQueue({
            location: options.location || 0,
            length: options.length || 1,
            includeMetadata: options.metadata,
            includeLyrics: options.lyrics,
            includeLanguageOptions: options.languages
        });
    })
        .then(message => {
        logger.info(message);
    })
        .catch(error => {
        logger.error(error.message);
        logger.debug(error.stack);
        process.exit();
    });
});
cli
    .command('messages', 'Log all messages sent from the Apple TV')
    .option('--credentials <credentials>', 'The device credentials from pairing', cli.STRING)
    .action((args, options, logger) => {
    if (!options.credentials) {
        logger.error("Credentials are required. Pair first.");
        process.exit();
    }
    let credentials = credentials_1.Credentials.parse(options.credentials);
    scan_1.scan(logger, null, credentials.uniqueIdentifier)
        .then(device => {
        device.on('debug', (message) => {
            logger.debug(message);
        });
        device.on('error', (error) => {
            logger.error(error.message);
            logger.debug(error.stack);
        });
        return device
            .openConnection(credentials);
    })
        .then(device => {
        device.on('message', (message) => {
            logger.info(JSON.stringify(message.toObject(), null, 2).replace(/(\r\n|\n|\r)/gm,""));
        });
    })
        .catch(error => {
        logger.error(error.message);
        logger.debug(error.stack);
        process.exit();
    });
});
cli.parse(process.argv);
