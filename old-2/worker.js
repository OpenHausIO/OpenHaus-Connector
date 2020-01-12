const cluster = require('cluster');
const Management = require("./lib/management.js");

// connect with management to device 
// create for each interface a handler


/**
 * Spawn/fork connector
 * @param {object} data 
 */
function spawn(data) {

    let worker = cluster.fork();

    worker.on("message", (msg) => {
        if (msg.running) {
            worker.send({
                device: data
            });
        }
    });


    worker.on("online", () => {
        console.log("Worker %d online", worker.process.pid);
    });


    worker.on("exit", () => {

        console.log("WORKER DIED!");

        setTimeout(() => {
            console.log("Respawn worker")
            spawn(data);
        }, 5000);

    });

}


module.exports = (list) => {
    if (cluster.isMaster) {

        console.log(`Master ${process.pid} is running`);

        // Fork workers.
        for (let i = 0; i < list.length; i++) {
            if (list[i].enabled) {

                // fork device worker
                spawn(list[i]);

            } else {

                // device is disabled
                // we need no connector

            }
        }

        cluster.on('exit', (worker, code, signal) => {
            console.log(`worker ${worker.process.pid} died`);
        });


    } else {

        console.log(`Worker ${process.pid} started`);

        process.send({
            running: true
        });

        const options = {
            //token: "...."
        };

        process.on("message", (data) => {
            if (data.device) {

                // start connection manager
                // create uplink for each interface
                require("./lib/lib.device.js")(data.device, options);

            }
        });

    }
};