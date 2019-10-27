const util = require("util");
const Uplink = require("./uplink.js").class;

function Management(url, token) {

    Uplink.call(this, url, {
        "x-token": token
    });

};

util.inherits(Management, Uplink);


Management.prototype.report = function (event, ...args) {
    if (this.websocket) {

        const message = JSON.stringify({
            event,
            args,
            report: true
        });

        this.send(message);

    }
};


Management.prototype.reported = function (event, cb) {
    if (this.websocket) {

        this.on("data", (data) => {

            const msg = JSON.parse(data);

            if (msg.event === event && msg.report) {
                cb.apply(data.args || []);
            }

        });

    }
};

module.exports = Management;