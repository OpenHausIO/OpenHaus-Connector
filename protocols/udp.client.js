const url = require("url");
const WebSocket = require("ws");

module.exports = (log, m) => {
    return (uplink, iface, device) => {
        try {


            // global vars
            var socket = null;
            var closing = false;

            const { host, port } = iface.settings;



            const connect = function () {

                if (socket) {
                    return;
                }


                log.debug("Connect to udp://%s:%d", host, port);

                socket = dgram.createSocket('udp4');
                socket.connect(port, host);

                socket.once("connect", () => {
                    log.info("Connected to device interface");
                    m.report(":iface.connected", iface);
                });

                socket.once("close", () => {

                    socket = null;

                    log.info("Disconnected from device interface");
                    m.report(":iface.disconnected", iface);

                    if (!closing) {

                        closing = false;

                        setInterval(function () {
                            if (socket) {

                                log.debug("Clear reconnect interval");
                                clearInterval(this);

                            } else {

                                log.debug("Try reconnect");
                                connect();

                            }
                        }, 5000);

                    }

                });

            };


            const disconnect = function () {

                closing = true;

                if (socket) {
                    socket.close();
                    socket = null;
                }

            }


            uplink.on("disconnected", () => {
                log.info("Interface Uplink disconnected");
                disconnect();
            });


            uplink.on("connected", (ws, stream) => {

                log.info("Interface Uplink connected");
                log.debug("Connect to device intreface");

                connect();

                setImmediate(() => {
                    ws.on("message", (data) => {
                        socket.send(data);
                    });
                });

            });




        } catch (e) {

            // programming error
            log.fatal(e, "udp.client.js error");

        }
    };
};