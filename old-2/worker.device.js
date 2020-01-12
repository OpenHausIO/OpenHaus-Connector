const ws = require("ws");
const interfaceStream = require("interface-stream");

const STORE = new Map();



module.exports = function (device) {
    device.interfaces.forEach((iface) => {
        try {

            const upstream = new interfaceStream({
                // duplex stream options
            });

            // try to require interface protocol handler
            const client = require(`./protocols/${iface.protocol}.client.js`)(upstream, iface);
            STORE.set(iface._id, client);


            upstream.on("attached", () => {
                client.connect();
            });

            upstream.on("detached", () => {
                client.disconnect();
            });

            const { PROTOCOL, SERVER } = process.env;

            let webSocket = new ws.WebSocket(`${PROTOCOL}://${SERVER}/api/devices/${device._id}/interfaces/${iface._id}`, {
                // duplex stream options
            });

            webSocket.on("open", () => {
                upstream.attach(webSocket);
            });

            webSocket.on("close", () => {
                upstream.detach();
            });


        } catch (e) {
            if (e.code === "ENOENT") {

                process.exit(1000);

            } else {

            }
        }
    });
};


process.on("message", (data) => {
    switch (data.event) {
        case "device":
            module.exports(data.data);
            break;
        case "disconnect":
            if (client = STORE.get(data.data._id)) {
                client.disconnect();
            }
            break;
    }
});