// https://github.com/websockets/ws/blob/HEAD/doc/ws.md

const argv = require("../argv.js");
const debug = require("debug")("OpenHaus:Connector.tcp.client");
const WebSocket = require("ws");
const net = require("net");




module.exports = (token, m, iface) => {

    // create websocket client
    const client = new net.Socket();

    // connect to webclient interface
    const ws = new WebSocket(`${argv.url}/interfaces/${iface._id}`, {
        headers: {
            "x-token": token
        }
    });

    client.on("connect", () => {

        debug("[client] connected to tcp://%s:%d", iface.host, iface.port);
        debug("FORWARD DATA BETWEEN <client> <-> <ws>");
        m.emit(":interface.ready", iface);

    });

    ws.on("open", () => {

        debug("[ws] connected to %s", ws.url);
        client.connect(iface.port, iface.host);

    });

    ws.on("error", (error) => {

        debug("[ws] Error", error);

        m.emit(":interface.error", {
            iface,
            error
        });

    });


    ws.on("message", (data) => {

        debug("[ws] > [client]", data);
        client.write(data);

    });


    client.on("data", (data) => {
        debug("[client] > [ws]", data);
        ws.send(data);
    });


    client.on("error", (error) => {

        debug("[client] Error", error);

        m.emit(":interface.error", {
            iface,
            error
        });

    });


};