const WebSocket = require("ws");
const events = require("events");
const util = require("util");

function Uplink(url, headers) {

    events.call(this);
    this.url = url;

    this.websocket = null;

    this.reconnect = true;
    this.closing = false;
    this.stream = null;

    this.headers = {
        "content-type": "application/json",
        ...headers
    };

    this.counter = {
        reconnect: {
            attempts: 0
        }
    };

    setImmediate(() => {
        this._connect();
    });

}

util.inherits(Uplink, events);


Uplink.prototype._connect = function () {

    const ws = this.websocket = new WebSocket(this.url, {
        headers: {
            ...this.headers,
        }
    });

    ws.once("open", () => {

        this.counter.reconnect.attempts = 0;

        this.stream = WebSocket.createWebSocketStream(ws, {
            // duplex stream options
        });

        setImmediate(() => {
            this.emit("connected", ws, stream);
        });

    });


    this.websocket.on("message", (data) => {
        this.emit("data", data);
    });


    this.websocket.on("close", () => {

        setImmediate(() => {
            this.emit("disconnected");
            this.stream = null;
        });

        if (this.reconnect && !this.closing) {

            // count up, multiplicator for delay
            let multi = this.counter.reconnect.attempts += 1;

            setTimeout(() => {
                this.emit("reconnect", this.url, this.headers);
                this._connect();
            }, multi * 1000);

        }

    });

};


Uplink.prototype.send = function (data) {
    if (this.websocket.readyState === WebSocket.OPEN) {
        this.websocket.send(data);
    }
};




module.exports = function (url, headers) {
    if (!(this instanceof Uplink)) {
        return new Uplink(url, headers);
    } else {
        return this;
    }
};


module.exports.class = Uplink;