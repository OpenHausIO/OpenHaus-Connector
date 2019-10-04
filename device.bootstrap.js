const cluster = require('cluster');
const management = require("./device.management.js");

// connect with management to device 
// create for each interface a handler

module.exports = (argv, list) => {
    if (cluster.isMaster) {


        // MAP FOR BINDING
        // worker.pid = list index!
        // FOR WORKER RESPAN!

        console.log(`Master ${process.pid} is running`);

        // Fork workers.
        for (let i = 0; i < list.length; i++) {

            let worker = cluster.fork();

            worker.on("message", (data) => {
                if (data.running) {

                    console.log("Send to worker %d:", i, list[i])

                    worker.send({
                        device: list[i]
                    });

                }
            });

            worker.on("online", () => {
                console.log("Worker %d online", i);
            });

            worker.on("exit", () => {
                console.log("WORKER DIED!");
            });

        }

        cluster.on('exit', (worker, code, signal) => {
            console.log(`worker ${worker.process.pid} died`);
        });


    } else {

        console.log(`Worker ${process.pid} started`);
        process.send({ running: true });


        process.on("message", (data) => {
            if (data.device) {


                // device received from cluster master
                console.log("Handlerstuff for device", data.device);


                const m = new managmenet();
                m.connect(`${argv.host}/${data.device._id}/connector`);


                data.device.interfaces.forEach(iface => {
                    if (iface.type === "ETHERNET") {
                        try {

                            // require procotol connector
                            const handler = require(`./ethernet/${iface.protocol}.client.js`);
                            handler(null, m, iface); // TODO TOKEN GENERATION!

                        } catch (e) {

                            console.log("Error protocol handler %s", iface.protocol, e);

                        }
                    } else {

                        // hardware
                        // RS232, IR, KNX

                    }
                });


            } else {

            }
        });

    }
};