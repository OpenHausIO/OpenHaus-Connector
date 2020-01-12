const net = require("net");

module.exports = (upstream, iface) => {
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

            upstream.pipe(socket);
            socket.pipe(upstream);

        };


        const disconnect = function () {

            closing = true;

            if (socket) {
                socket.destroy();
                socket = null;
            }

        }


        return {
            connect,
            disconnect
        };


    } catch (e) {

        // programming error
        log.fatal(e, "tcp.client.js error");

    }

};