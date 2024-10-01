import axios from "axios";
import net from "net";

import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const ROOT_DIR = path.resolve(dirname(__filename));

console.log(ROOT_DIR);

var tcpServer = net.createServer((socket) => {
    socket.write("echo server !\n")
    
    socket.on("data", (clientData) => {
        console.log(`client sent ${clientData}`);


    try {
        const json = JSON.parse(clientData)
        json.time = Date.now()
        axios.post("http://localhost:3000/api/th", json).then(res => {
            if (res.status === 200)console.log("200 OK");
        }).catch((err) => {
            console.log(err)
        })
    } catch (err) {
        console.log("received wrong format.")
    }

    })

    socket.on('end', () => {
        console.log('Client disconnected');
    });

    // Handle errors
    socket.on('error', (err) => {
        console.error(`Socket error: ${err.message}`);
    });


})

tcpServer.listen(5000, () => {
    console.log("Tcp server listening on port 5000")
});

tcpServer.on('error', (err) => {

    console.error(`Socket error: ${err.message}`)
})