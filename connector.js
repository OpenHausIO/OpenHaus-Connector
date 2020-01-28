const interfaceStream = require("interface-stream");
const WebSocket = require("ws");

/**
 * Connector
 * @constructor
 */
function Connector() {

    this.protocols = {};

    this.options = Object.assign({
        reconnectDelay: 5000
    });

    const noop = console.log;


    this.logger = {
        verbose: noop,
        debug: noop,
        info: noop,
        warn: noop,
        error: noop,
        fatal: noop
    };


    // register protocol handler
    this.register("tcp", require("./protocols/tcp.client.js"));
    this.register("udp", require("./protocols/udp.client.js"));
    this.register("http", require("./protocols/tcp.client.js"));
    this.register("https", require("./protocols/tcp.client.js"));
    this.register("ws", require("./protocols/tcp.client.js"));

};


/**
 * Register a handler function for protocol
 * @param {string} name
 * @param {function} hanlder
 */
Connector.prototype.register = function (name, handler) {

    const logger = this.logger;

    Object.defineProperty(this.protocols, name, {
        value: handler(logger),
        writable: false
    });

};


/**
 * Create a bridge url to iface settings
 * @param {string} url WebSocket Endpoint on server
 * @param {object} iface Interface Object from server
 */
Connector.prototype.bridge = function (url, iface) {
    if (iface.settings.protocol in this.protocols) {

        // get handler function
        const handler = this.protocols[iface.settings.protocol];

        // create interface uplink
        const uplink = new interfaceStream({
            // duplex stream options
        });

        // websocket re-connect wrapper
        const connect = () => {

            // connect to websocket server
            const ws = new WebSocket(url, {
                // options
            });

            ws.once("open", () => {
                // console.log("Connected to interface %s", url);
                process.nextTick(() => {
                    uplink.attach(ws);
                });

            });

            ws.once("close", () => {
                uplink.detach();
                setTimeout(connect, this.options.reconnectDelay);
            });

            ws.once("error", (err) => {
                //event.emit("error", err, iface);
                this.log.error(err, "WebSocket Uplink error: %s", err.message);
                setTimeout(connect, this.options.reconnectDelay);
            });

        };

        // create handler
        handler(uplink, iface);

        // connect to websocket
        process.nextTick(() => {
            connect();
        });

    } else {
        const error = new Error("PROTOCOL_NOT_REGISTERD");
        error.message = "Protocol xxx no handler registerd";
        throw error;

    }
};

module.exports = Connector;