const url = require("url");

module.exports = (argv, cb) => {

    const HOST = (argv.host || process.env.HOST || "localhost");
    const TOKEN = (argv.token || process.env.TOKEN || null);


    const parsed = new url.URL(HOST);
    const protocol = parsed.protocol.slice(0, -1);

    if (["http", "https"].indexOf(protocol) === -1) {
        throw new Error("INVALID_HOST_PROTOCOL");
    }

    // create http request
    const request = require(protocol).request(`${HOST}/api/devices`, {
        headers: {
            "x-token": TOKEN,
            "Content-Type": "application/json"
        }
    });


    request.on("response", (res) => {

        if (res.statusCode !== 200) {
            console.log(res.statusCode)
            throw new Error("INVALID_HTTP_STATUS");
        }

        let body = "";

        res.on("data", (chunk) => {
            body += chunk;
        });

        res.on("end", () => {
            cb(JSON.parse(body));
        });

    });


    // no data to send
    request.end();

};