const Uplink = require("./uplink.js").class;
const Manager = require("./management.js");
const winston = require("winston");
const dateFormat = require("dateformat");
const safe = require("colors/safe");

const Levels = {
    levels: {
        error: 0,
        warn: 1,
        notice: 2,
        info: 3,
        debug: 4,
        verbose: 5
    },
    colors: {
        error: "red",
        warn: "yellow",
        notice: "magenta",
        info: "blue",
        debug: "gray",
        verbose: "cyan"
    }
};

const consoleFormat = (name) => {
    return winston.format.combine(
        winston.format.label({
            label: name
        }),
        winston.format.timestamp(),
        winston.format.splat(),
        winston.format.printf((msg) => {

            //@ts-ignore
            const color = safe[Levels.colors[msg.level]];

            const timestamp = dateFormat(msg.timestamp, "yyyy.mm.dd - HH:MM.ss.l");
            return `[${color(timestamp)}][${color(msg.label)}][${color(msg.level)}] ${msg.message}`;

        })
    )
};

const log = winston.createLogger({
    levels: Levels.levels,
    exitOnError: false,
    level: "verbose",
    transports: [
        new winston.transports.Console({
            format: consoleFormat("system")
        })
    ]
});



module.exports = (device, options) => {
    try {

        const HOST = (options.host || process.env.HOST || "localhost");
        const TOKEN = (options.token || process.env.TOKEN || null);

        const interfaces = device.interfaces;
        const m = new Manager(`${HOST}/api/devices/${device._id}/connector`, TOKEN);


        interfaces.filter((e) => {
            return e.type.toUpperCase() == "ETHERNET";
        }).forEach(iface => {
            try {

                // require procotol connector
                const u = new Uplink(`${HOST}/api/devices/${device._id}/interfaces/${iface._id}`);
                const handler = require(`../protocols/${iface.settings.protocol}.client.js`);


                let logger = winston.createLogger({
                    levels: Levels.levels,
                    exitOnError: false,
                    level: "verbose",
                    transports: [
                        new winston.transports.Console({
                            format: consoleFormat("iface")
                        })
                    ]
                });

                // feedback
                logger.info("Create handler for device %s", device._id);


                const connector = handler(logger, m);
                connector(u, iface, device);

            } catch (e) {

                log.error(e, "Error protocol handler %s", iface.protocol);

            }
        });



    } catch (e) {

        log.fatal(e, "lib.device.js fatal");

    };
};