const management = require("../device.management.js");
const minimist = require("minimist");

const argv = minimist(process.argv.slice(2), {
    string: ["url"],
    //boolean: ['version'],
    //alias: { v: 'version' }
});

console.log("Connect to management url %s", argv.url);
const m = new management();

m.on("error", (e) => {
    console.log("Error!", e);
});

m.on("connected", () => {
    console.log("Connected to management URL: %s", m.websocket.url);
});

m.once("connected", () => {
    console.log("Disconnect after 5sec...");
});

m.on("disconnected", () => {
    console.log("Disconnected from management URL: %s", m.websocket.url);
});


m.on("reconnect", (url, header) => {
    // should only be trigged when serve/internet goes down
    console.log("Reconnect to URL: %s, header: %j", url, header);
});

// 192.168.2.116/api/devices/5d8cf6d58cee5013f5971fbd/connector
console.log("Connect...");
m.connect(argv.url);


setTimeout(() => {

    console.log("Disconnect...");
    m.disconnect();

    setTimeout(() => {
        console.log("Connect again...")
        m.connect(argv.url);
    }, 1000);

}, 5000);




//m.report("interface.error", iface, error);

m.reported("interface.settings", (iface, data) => {
    console.log("Settings for interface changes", iface, data)
});