module.exports = require("./connector.js");

if (!module.parent) {
    require("./cli.js");
}