// https://github.com/websockets/ws/blob/HEAD/doc/ws.md

const argv = require("../argv.js");
const debug = require("debug")("OpenHaus:Connector.ws.client");
const WebSocket = require("ws");



module.exports = (token, m, iface) => {

    process.on("uncaughtException", (e) => {

        console.log("UNCAUGHEXECPETOIPON, keep node running")
        console.log(e);

        // tell server what is wrong
        m.emit(":connector.error", e);

    });



    const conf = iface.settings;

    const client = new WebSocket(`ws://${conf.host}:${conf.port}/${conf.path}`);




    // connect to webclient interface
    const ws = new WebSocket(`${argv.url}/interfaces/${iface._id}`, {
        headers: {
            "x-token": token
        }
    });


    ws.on("message", (data) => {
        console.log("Send message to client", data)
        //client.send(data)
    });

    client.on("error", (e) => {
        if (e.code === "EHOSTUNREACH") {

            console.log("HOST NOT REACHABLE!")

        }
    });


    const clientStream = WebSocket.createWebSocketStream(ws);
    const wsStream = WebSocket.createWebSocketStream(client);







    clientStream.pipe(wsStream);
    wsStream.pipe(clientStream);



    ws.on("open", () => {
        debug("[ws] connected to %s", ws.url);
    });


    ws.on("error", (error) => {

        debug("[ws] Error", error);

        m.emit(":interface.error", {
            iface,
            error
        });

    });


    client.on("open", () => {

        debug("[ws] (Client) connected to %s", client.url);

    });

    client.on("error", (error) => {

        debug("[client] Error", error);

        m.emit(":interface.error", {
            iface,
            error
        });

    });

};