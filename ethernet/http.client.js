const net = require("net");
const Uplink = require("../uplink.js");

module.exports = (token, m, iface, device, host) => {

    console.log("HTTP")

    // create uplink to server
    const uplink = new Uplink(`${host}/${device._id}/interfaces/${iface._id}`, {
        "x-token": token
    });


    function connect(stream) {

        let counter = 0;
        const socket = new net.Socket();
        socket.setKeepAlive(true);


        socket.pipe(stream, { end: false });
        stream.pipe(socket, { end: false });


        socket.connect(iface.settings.port, iface.settings.host);


        socket.on("close", () => {

            console.log("tcp socket closed");
            m.report("disconnected", iface);

            socket.destroy();
            setTimeout(connect, counter * 1000);

        });

        socket.on("connect", () => {

            counter = 0;
            m.report("connected", iface);

            console.log("tcp socket connect")
            console.log(`Connected to target http://${iface.settings.host}:${iface.settings.port}`);

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


    ////////////////////////////77



    uplink.on("connected", function () {
        connect(this.stream);
        console.log("Connected to server");
    });

    uplink.on("disconnected", () => {
        console.log("Disconnected from server");
    });

    /*
    uplink.on("data", (data) => {
        console.log("DATA>", data);
    });*/

    //uplink.send("data...");

};