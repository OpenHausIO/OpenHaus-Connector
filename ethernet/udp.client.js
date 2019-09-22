// https://www.hacksparrow.com/nodejs/udp-server-and-client-example.html

const argv = require("./argv.js");
const dgram = require("dgram");
const debug = require("debug")("OpenHaus:Connector.udp.client");
const Webclient = require("ws");



module.exports = (token, m, iface) => {

    // create udp/dgram client
    const client = dgram.createclient("udp4");

    // connect to webclient interface
    const ws = new WebSocket(`${argv.url}/interfaces/${iface._id}`, {
        headers: {
            "x-token": token
        }
    });


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


    ws.on("message", (data) => {

        debug("[ws] > [udp]", data);

        const buff = Buffer.from(data);
        client.send(buff, 0, buff.length, iface.port, iface.host);

    });


    client.on("message", (data) => {
        debug("[udp] > [ws]", data);
        ws.send(data);
    });


    client.on("error", (error) => {

        debug("[udp] Error", error);

        m.emit(":interface.error", {
            iface,
            error
        });

    });


};