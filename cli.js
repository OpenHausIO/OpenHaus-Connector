require("dotenv").config();

const url = require("url");
const Connector = require("./connector.js");
const connector = new Connector();



//const HOST = "https://open-haus.cloud";
const HOST = (process.env.HOST || "http://127.0.0.1");
const TOKEN = (process.env.TOKEN || null);


/**
 * Create http/https request & follow redirects
 * @param {string} uri 
 * @param {function} cb 
 */
function request(uri, cb) {

    const parsed = new url.URL(HOST);
    const protocol = parsed.protocol.slice(0, -1);

    if (["http", "https"].indexOf(protocol) === -1) {
        throw new Error("INVALID_HOST_PROTOCOL");
    }

    // create http request
    const request = require(protocol).request(uri, {
        headers: {
            "x-token": TOKEN,
            "Content-Type": "application/json"
        }
    });


    request.on("response", (res) => {

        const statusCode = res.statusCode;
        const location = response.headers.location;

        if (location && statusCode >= 300 && statusCode < 400) {
            return request(loction, (err, data) => {

                if (err) {
                    return cb(err);
                }

                cb(null, data);

            });
        }

        if (statusCode !== 200) {
            cb(new Error("INVALID_HTTP_STATUS"));
        }

        let body = "";

        res.on("data", (chunk) => {
            body += chunk;
        });

        res.on("end", () => {
            cb(null, body);
        });

    });


    request.on("error", (err) => {
        cb(err);
    });


    // no data to send
    request.end();

}


/**
 * Fetch list of devices
 * @param {function} cb 
 */
function getDeviceList(cb) {
    request(`${HOST}/api/devices`, (err, body) => {

        if (err) {
            return cb(err);
        }

        cb(null, JSON.parse(body));

    });
};


getDeviceList((err, list) => {

    if (err) {
        console.log(err);
        process.exit();
        return;
    }

    list.interfaces.forEach((iface) => {
        connector.bridge(`${HOST}/api/interfaces/${iface._id}`, iface);
    });

});

/*
connector.bridge("http://127.0.0.1/api/interfaces/asdfasdfasdf", {
    protocol: "tcp",
    host: "192.168.2.10",
    port: 65300
});
*/