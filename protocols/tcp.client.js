const net = require("net");

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

                log.debug("Connect to tcp://%s:%d", host, port)

                socket = new net.Socket();
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
                                connect(host, port);

                            }
                        }, 5000);

                    }

                });

            };


            const disconnect = function () {

                closing = true;

                if (socket) {
                    socket.destory();
                    socket = null;
                }

            }


            uplink.on("disconnect", () => {
                log.info("Interface Uplink disconnected");
                disconnect();
            });


            uplink.on("connect", (ws, stream) => {

                log.info("Interface Uplink connected");

                log.debug("Init device interface connect");
                connect();

                stream.pipe(socket);
                socket.pipe(stream);

            });



        } catch (e) {

            // programming error
            log.fatal(e, "tcp.client.js error");

        }
    };
};