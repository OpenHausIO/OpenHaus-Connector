if (process.env.NODE_ENV !== "production") {
    require("dotenv")();
}

if (!module.parent) {

    const minimist = require("minimist");
    const pkg = require("./package.json");

    const argv = minimist(process.argv.slice(2), {
        string: ["host"],
        boolean: ["version"],
        alias: {
            v: "version"
        }
    });

    if (argv.version) {
        console.log("Version: %s", pkg.version);
        return process.exit(0);
    }

    // get device infos from server
    require("./rest-client.js")(argv, (list) => {
        require("./device.bootstrap.js")(argv, list);
    });

} else {

    // export management lib
    module.exports = require("./device.management.js");

}
