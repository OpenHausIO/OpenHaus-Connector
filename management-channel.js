const argv = require("./argv.js");

const WebSocket = require("ws");
const events = require("events");
const debug = require("debug")("OpenHaus:Connector.management");



const emitter = new events.EventEmitter();
const _emit = emitter.emit.bind(emitter);
const ws = new WebSocket(`${argv.url}/connector`);

debug("Try url %s", ws.url);


ws.on("open", () => {
    debug("[ws] Connected to %s", ws.url);
});


ws.on("close", () => {

    debug("[ws] Disconnected from %s", ws.url);

    if (process.env.NODE_ENV !== "production") {
        process.exit(1);
    }

});

ws.on("error", (err) => {

    debug(err);

    if (process.env.NODE_ENV !== "production") {
        process.exit(1);
    }

});



// wrap ws events
// NOTE: needed? -> if you want to listen on ws events, use the emitter.ws exported object!
/*
["close", "error", "message", "open", "ping", "pong", "unexpected-response", "upgrade"].forEach(e => {
    ws.on(e, (...args) => {
        _emit.apply(emitter, [e].concat(args));
    });
});*/


ws.on("message", (data) => {
    try {

        debug("[ws] Incoming message:", data);

        const json = JSON.parse(data);
        _emit(`${json.event || "warning"}`, json.data);

    } catch (e) {

        debug("JSON parse error", e);

    }
});


const emit = function emit(...args) {
    try {

        debug("[emitter] emit called:", args);
        _emit.apply(emitter, args);

        const message = {
            event: args[0],
            data: args[1]
        };

        debug("[ws] send", message);
        ws.send(JSON.stringify(message));

    } catch (e) {

        debug("emit error", e);

    }
}


emitter.emit = emit;
emitter.ws = ws;
module.exports = emitter;