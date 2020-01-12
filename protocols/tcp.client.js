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

                if (socket) {
                    return;
                }

                log.debug("Connect to tcp://%s:%d", host, port)

                socket = new net.Socket();
                socket.connect(port, host);

                uplink.pipe(socket);
                socket.pipe(uplink);


                socket.once("connect", () => {
                    log.info("Connected to device interface");
                });


                socket.once("close", () => {

                    log.info("Disconnected from device interface");

                    if (!closing) {

                        interval = setInterval(function () {
                            if (socket) {

                                log.debug("Clear reconnect interval");
                                clearInterval(this);

                            } else {

                                log.debug("Try reconnect");
                                connect(host, port);

                            }
                        }, 10000);

                        closing = false;
                        socket = null;

                    }

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


            uplink.on("attached", () => {
                connect();
            });

            uplink.on("detached", () => {
                disconnect();
            });



        } catch (e) {

            // programming error
            log.fatal(e, "tcp.client.js error");

        }
    };
};