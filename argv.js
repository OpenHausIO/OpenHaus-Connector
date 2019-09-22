const minimist = require("minimist");
const pkg = require("./package.json");
const debug = require("debug")("OpenHaus:Connector.argv");

const argv = minimist(process.argv.slice(2), {
    string: ["protocol", "host", "device"],
    boolean: ['version'],
    alias: { v: 'version' }
});


if (argv.version) {
    console.log("Version: %s", pkg.version);
    return process.exit(0);
}


if (!argv.url && !argv.device) {
    console.log("Device argument not given!");
    return process.exit(1);
}


if (!argv.url) {
    argv.url = `${argv.protocol || "http"}://${argv.host || "127.0.0.1"}:${argv.port || 80}/api/devices/${argv.device}`;
    debug("Build url: %s", argv.url);
}



module.exports = argv;