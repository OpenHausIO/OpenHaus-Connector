console.log("Starting OpenHaus:Connector...");


if (process.env.NODE_ENV !== "production") {
    require("clear")();
    require("dotenv").config();
}

const debug = require("debug");


// validate cli args
const argv = require("./argv.js");
debug("index.js > argv", argv);

// connect to management channel
const m = require("./management-channel.js");




m.on(":settings", (data) => {
    // device config settings
});


m.on(":interfaces", (data) => {

    // interface settings
    debug("interfaces data", data);


    data.forEach(iface => {
        if (iface.type == "ETHERNET") {

            debug("Start %s.client handler", iface.protocoll);

            // require protocoll handler for interface
            require(`./ethernet/${iface.protocoll}.client.js`)("token", m, iface);

        } else {

            debug("Handler %s not implementet yet!", iface.type);
            //require(`./hardware/${iface.protocoll}.js`)("token", m, iface);

        }
    });

});