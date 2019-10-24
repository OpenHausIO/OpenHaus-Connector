const Uplink = require("./uplink.js").class;
const Manager = require("./management.js");


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
                const handler = require(`../protocols/${iface.settings.protocol}.client.js`);
                const logger = null; //new logger();

                const u = new Uplink(`${HOST}/api/devices/${device._id}/interfaces/${iface._id}`);
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