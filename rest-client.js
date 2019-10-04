const url = require("url");

module.exports = (argv, cb) => {

    const parsed = new url.URL(argv.host);
    const protocol = parsed.protocol.slice(0, -1);

    if (["http", "https"].indexOf(protocol) === -1) {
        throw new Error("INVALID_HOST_PROTOCOL");
    }

    // create http request
    const request = require(protocol).request(argv.host, {
        headers: {
            "Content-Type": "application/json"
        }
    });


    request.on("response", (res) => {

        if (res.statusCode !== 200) {
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