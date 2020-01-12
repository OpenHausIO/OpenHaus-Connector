const ifaceStream = require("interface-stream");
const WebSocket = require("ws");

function Connector() {

    this.protocols = {};

    this.options = Object.assign({
        reconnectDelay: 5000
    });

    function noop() {
        return console.log;
    }

    this.logger = {
        verbose: noop,
        debug: noop,
        info: noop,
        warn: noop,
        error: noop
    };


    // register protocol handler
    this.register("tcp", require("./protocols/tcp.client.js"));
    //this.register("udp", require("./protocols/tcp.client.js"));
    this.register("http", require("./protocols/tcp.client.js"));
    this.register("https", require("./protocols/tcp.client.js"));
    this.register("ws", require("./protocols/tcp.client.js"));

};


Connector.prototype.register = function (name, handler) {

    const logger = this.logger;

    Object.defineProperty(this.protocols, name, {
        value: handler(logger),
        writable: false
    });

};

Connector.prototype.bridge = function (url, iface) {
    if (iface.protocol in this.protocols) {

        // get handler function
        const handler = this.protocols[iface.protocol];

        // create interface uplink
        const uplink = new interfaceStream({
            // duplex stream options
        });

        // websocket re-connect wrapper
        const connect = function connect() {

            // connect to websocket server
            const ws = new WebSocket(url, {
                // options
            });

            ws.once("open", () => {
                uplink.attach(ws);
            });

            ws.once("close", () => {
                //event.emit...
                uplink.detach();
                setTimeout(connect, this.options.reconnectDelay);
            });

            ws.once("error", (err) => {
                //event.emit("error", err, iface);
                setTimeout(connect, this.options.reconnectDelay);
            });

        };

        // create handler
        handler(uplink, iface);

        // connect to websocket
        connect();

    } else {

        throw new Error("PROTOCOL_NOT_REGISTERD");

    }
};

module.exports = Connector;