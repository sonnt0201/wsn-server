import axios from "axios";
import net from "net";

import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const ROOT_DIR = path.resolve(dirname(__filename));

console.log(ROOT_DIR);

const clients = [];  // Array to store all connected clients

var tcpServer = net.createServer((socket) => {
    console.log('Client connected');
    // Add the new client to the list of clients
    clients.push(socket);

    socket.write("echo server !\n");

    socket.on("data", (clientData) => {
        console.log(`Client sent: ${clientData}`);

        // Forward the message to all other clients except the sender
        clients.forEach((client) => {
            if (client !== socket) {  // Check if the client is not the sender
                client.write(clientData);
            }
        });

        // Optional: Handle JSON data, similar to your previous code
        try {
            const json = JSON.parse(clientData);
            json.time = Date.now();
            axios.post("http://localhost:3000/api/th", json)
                .then(res => {
                    if (res.status === 200) console.log("200 OK");
                })
                .catch((err) => {
                    console.log(err);
                });
        } catch (err) {
            console.log("Received wrong format.");
        }
    });

    socket.on('end', () => {
        console.log('Client disconnected');
        // Remove the client from the list when they disconnect
        const index = clients.indexOf(socket);
        if (index !== -1) {
            clients.splice(index, 1);
        }
    });

    // Handle errors
    socket.on('error', (err) => {
        console.error(`Socket error: ${err.message}`);
    });
});

tcpServer.listen(5000, () => {
    console.log("TCP server listening on port 5000");
});

tcpServer.on('error', (err) => {
    console.error(`Server error: ${err.message}`);
});
