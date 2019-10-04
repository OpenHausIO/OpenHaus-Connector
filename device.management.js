const WebSocket = require("ws");
const events = require("events");
const util = require("util");


function Management(options) {

    events.call(this);

    this.options = {
        ...options,
        reconnect: true
    };

    this.websocket = null;
    this.closing = false;
    this.counter = {
        reconnect: {
            attempts: 0
        }
    }

};

util.inherits(Management, events);


Management.prototype.connect = function (url, header) {

    this.closing = false;

    const ws = this.websocket = new WebSocket(url, {
        headers: {
            ...header,
            "Content-Type": "application/json"
        }
    });

    ws.once("open", () => {

        this.counter.reconnect.attempts = 0;

        setImmediate(() => {
            this.emit("connected", ws);
        });

    });

    ws.once("close", () => {

        //this.websocket = null;

        if (this.options.reconnect && !this.closing) {

            // count up, multiplicator for delay
            let multi = this.counter.reconnect.attempts += 1;

            setTimeout(() => {

                this.emit("reconnect", url, header);
                this.connect(url, header);

            }, multi * 1000);

        }

    });

    ws.once("error", (e) => {
        this.emit("error", e);
    });

};


Management.prototype.disconnect = function () {

    this.closing = true;

    this.websocket.once("close", () => {
        this.emit("disconnected");
    });

    if (this.websocket) {
        setImmediate(() => {
            this.websocket.close();
        });
    }

};


Management.prototype.report = function (event, ...args) {
    if (this.websocket) {

        const message = JSON.stringify({
            event,
            args,
            report: true
        });

        this.websocket.send(message);

    }
};


Management.prototype.reported = function (event, cb) {
    if (this.websocket) {

        this.websocket.on("message", (data) => {
            if (data.event === event && data.report) {

                cb.apply(data.args);

            }
        });

    }
};


Management.prototype.interface = function (iface) {
    // TODO
    // sub event emitter specific for interface
    // same like report/reported but with iface namespace
};



module.exports = Management;