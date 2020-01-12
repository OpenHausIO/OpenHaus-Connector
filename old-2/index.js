process.env = Object.assign({
    PROTOCOL: "https",
    SERVER: "open-haus.lan",
    TOKEN: ""
}, process.env);

if (process.env.NODE_ENV !== "production") {
    const dot = require("dotenv").config();
    Object.assign(process.env, dot.parsed);
}

if (!module.parent) {



} else {

    module.exports = {
        device: require("./worker.device.js")
    };

}