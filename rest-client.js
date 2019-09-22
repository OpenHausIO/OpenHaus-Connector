const child = require("child_process");
const http = require("http");
const debug = require("debug")("Connector.rest-client");

debug("Init....");

const req = http.request("http://localhost:80/api/devices", {
    headers: {
        "Content-Type": "application/json"
    }
});


const fork = (device) => {

    debug("Fork connector, device %s", device);

    const connector = child.fork("index.js", [
        `--device=${device}`
    ]);

    connector.on("exit", () => {

        debug("Connector exit");

        setTimeout(() => {
            fork(device);
        }, 1000);

    });

    connector.on("close", () => {
        debug("Connector closed");
    });

};


const forkChilds = function (devices) {
    devices.forEach(e => {

        debug("Fork connector '%s'", e.name);
        fork(e._id);

    });
};



const getDevices = () => {
    let body = "";

    req.on("response", (res) => {

        res.on("data", (chunk) => {
            body += chunk;
        });

        res.on("end", () => {

            debug("Response from api server");
            forkChilds(JSON.parse(body));

        });

    });

    req.end();

};

getDevices();



process.on("exit", () => {

    console.log("Reconnect!");
    setTimeout(() => {
        console.log("get devies");
        getDevices();
    }, 1000);

});