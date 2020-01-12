const url = require("url");
const WebSocket = require("ws");

module.exports = (log, m) => {
    return (uplink, iface, device) => {
        try {


            // global vars
            var socket = null;
            var closing = false;

            const { host, port, path } = iface.settings;



            const connect = function () {

                if (socket) {
                    return;
                }

                const URI = new url.URL();

                URI.protocol = "ws";
                URI.host = host;
                URI.port = port;
                URI.path = path;

                log.debug("Connect to %s", URI);

                socket = new WebSocket(URI, {
                    // options
                });

                socket.once("open", () => {
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
                    socket.destory();
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

                const target = WebSocket.createWebSocketStream(socket, {
                    // duplex stream options
                });

                target.pipe(stream);
                stream.pipe(target);

            });





        } catch (e) {

            // programming error
            log.fatal(e, "ws.client.js error");

        }
    };
};