const WebSocket = require("ws");
const events = require("events");
const util = require("util");

function Uplink(url) {

    events.call(this);
    this.url = url;

    this.reconnect = true;
    this.closing = false;
    this.stream = null;

    this.counter = {
        reconnect: {
            attempts: 0
        }
    }

    setImmediate(() => {
        this._connect();
    });

}

util.inherits(Uplink, events);


Uplink.prototype._connect = function () {

    const ws = this.websocket = new WebSocket(this.url, {
        headers: {
            ...this.header,
            "Content-Type": "application/json"
        }
    });

    ws.once("open", () => {

        this.counter.reconnect.attempts = 0;

        this.stream = WebSocket.createWebSocketStream(ws, {
            // duplex stream options
        });

        setImmediate(() => {
            this.emit("connected", ws);
        });

    });


    this.websocket.on("message", (data) => {
        this.emit("data", data);
    });


    this.websocket.on("close", () => {

        this.stream = null;

        setImmediate(() => {
            this.emit("disconnected");
        });

        if (this.reconnect && !this.closing) {

            // count up, multiplicator for delay
            let multi = this.counter.reconnect.attempts += 1;

            setTimeout(() => {
                this.emit("reconnect", url, header);
                this.connect(url, header);
            }, multi * 1000);

        }

    });

};


Uplink.prototype.send = function (data) {
    if (this.websocket.readyState === WebSocket.OPEN) {

        this.websocket.send(data);

    }
};




module.exports = function (url, header) {
    if (!(this instanceof Uplink)) {
        return new Uplink(url, header);
    } else {
        return this;
    }
};