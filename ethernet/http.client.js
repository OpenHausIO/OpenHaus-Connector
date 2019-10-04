// https://github.com/websockets/ws/blob/HEAD/doc/ws.md

const argv = require("../argv.js");
const WebSocket = require("ws");
const net = require('net');


//TODO add socket error handling (net&ws)
// - socket end
// - socket destroyed

module.exports = (token, m, iface) => {

    // connect to webclient interface
    var ws = new WebSocket(`${argv.url}/interfaces/${iface._id}`, {
        headers: {
            "x-token": token
        }
    });


    ws.on("close", () => {

        console.log("Interface connection closed");

        ws = new WebSocket(`${argv.url}/interfaces/${iface._id}`, {
            headers: {
                "x-token": token
            }
        });


    });


    function connect(stream) {

        const socket = new net.Socket();
        socket.setKeepAlive(true);


        socket.pipe(stream, { end: false });
        stream.pipe(socket, { end: false });


        socket.connect(iface.port, iface.host);


        socket.on("close", () => {

            m.report("disconnected", iface);

            console.log("tcp socket closed");
            socket.destroy();
            setTimeout(connect, 500);

        });

        socket.on("connect", () => {

            m.report("connected", iface);

            console.log("tcp socket connect")
            console.log(`Connected to target http://${iface.host}:${iface.port}`);

        });

        socket.on("data", () => {
            console.log("tcp socket data")
        });

        socket.on("drain", () => {
            console.log("tcp socket drain")
        });

        socket.on("end", () => {
            console.log("tcp socket end")
        });

        socket.on("error", (err) => {
            console.log("tcp socket error", err)
        });

        socket.on("lookup", () => {
            console.log("tcp socket lookup")
        });

        socket.on("ready", () => {
            console.log("tcp socket ready")
        });

        socket.on("timeout", () => {
            console.log("tcp socket timeout")
        });


    }

    ws.on("open", () => {

        console.log("Interface connection open")

        const stream = WebSocket.createWebSocketStream(ws, {
            allowHalfOpen: true
        });


        connect(stream);



    });




};