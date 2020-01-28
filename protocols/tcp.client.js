const net = require("net");

module.exports = (log) => {
    return (uplink, iface) => {
        try {

            // global vars
            var socket = null;
            var closing = false;
            var interval = null;

            const { host, port } = iface.settings;

            const connect = function () {

                if (socket || interval) {
                    return;
                }

                log.debug("Connect to tcp://%s:%d", host, port)

                socket = new net.Socket();
                socket.connect(port, host);


                socket.once("connect", () => {

                    log.info("Connected to device interface (%s:%d)", host, port);

                    // pipe only after connect
                    // prevent event emitter leak
                    uplink.pipe(socket);
                    socket.pipe(uplink);

                });


                socket.once("close", () => {

                    log.info("Disconnected from device interface tcp://%s:%d", host, port);

                    if (!closing) {

                        interval = setInterval(function () {
                            if (socket) {

                                log.debug("Clear reconnect interval");
                                clearInterval(interval);

                            } else {

                                log.debug("Try reconnect");
                                connect();

                            }
                        }, 10000);

                        closing = false;
                        socket = null;

                    }

                });

                socket.once("error", (err) => {
                    log.error(err, "Connection error (%s:%d)", host, port);
                });

            };


            const disconnect = function () {

                log.debug("Disconnect fron tcp://%s:%d", host, port);

                closing = true;

                if (socket) {
                    socket.destroy();
                    socket = null;
                }

                clearInterval(interval);

            }


            uplink.on("websocket.attached", () => {
                connect();
            });

            uplink.on("websocket.detached", () => {
                disconnect();
            });



        } catch (e) {

            // programming error
            log.fatal(e, "tcp.client.js error");

        }
    };
};