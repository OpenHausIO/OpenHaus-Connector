const dgram = require("dgram");

// https://www.hacksparrow.com/nodejs/udp-server-and-client-example.html

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

        console.log("[ws] connected to %s", ws.url);

    });


    ws.on("error", (error) => {

        console.log("[ws] Error", error);

        m.emit(":interface.error", {
            iface,
            error
        });

    });


    ws.on("message", (data) => {

        console.log("[ws] > [udp]", data);

        const buff = Buffer.from(data);
        client.send(buff, 0, buff.length, iface.port, iface.host);

    });


    client.on("message", (data) => {
        console.log("[udp] > [ws]", data);
        ws.send(data);
    });


    client.on("error", (error) => {

        console.log("[udp] Error", error);

        m.report("error", iface, error);

    });


};