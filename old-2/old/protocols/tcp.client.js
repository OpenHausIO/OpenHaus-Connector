const net = require("net");

module.exports = (log, m) => {
    return (uplink, iface, device) => {
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

                socket.once("connect", () => {
                    log.info("Connected to device interface");
                    m.report(":iface.connected", iface);
                });

                socket.once("close", () => {

                    log.info("Disconnected from device interface");
                    m.report(":iface.disconnected", iface);

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

            }


            uplink.on("disconnected", () => {
                log.info("Interface Uplink disconnected");
                disconnect();
                process.nextTick(() => {
                    clearInterval(interval);
                });

            });


            uplink.on("connected", (ws, stream) => {

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