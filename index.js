const child = require('child_process')
const express = require('express')
const http = require('http')
const ws = require('ws')

const app = express();
const server = http.createServer(app);
const wss = new ws.Server({ server });

wss.on('connection', ws => {
    ws.send('Connection Established');
    ws.on('message', message => {
        var isJSON = true
        try {
            JSON.parse(message)
        } catch {
            isJSON = false
            ws.send("Not JSON Format")
        }
        if (isJSON) {
            if (JSON.parse(message).authorization != "secret") {
                ws.send("You are not Authorized")
            } else if (JSON.parse(message).command === undefined || JSON.parse(message).command === '') {
                ws.send("No Command Provided")
            } else {
                var jsonMessage = JSON.parse(message).command
                var params = jsonMessage.split(' ')
                var command = params[0]
                params.shift()
                var bash = child.spawn(command, params)
                bash.stdout.on('data', data => {
                    console.log(data.toString())
                    ws.send(data.toString())
                })
                bash.stderr.on('data', data => {
                    console.log(data.toString())
                    ws.send(data.toString())
                })
            }
        }
    });
});

server.listen(process.env.PORT || 8080, () => {
    console.log(`WebSocket Server Started`);
});