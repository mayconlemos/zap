'use strict';
const cors = require('cors');
const express = require('express');
const app = express();
const path = require('path')
const server = require('http').Server(app);
const io = require('socket.io')(server);
const routes = require('./routes');
var bodyParser = require('body-parser')
const PORT = process.env.PORT || 5000;
const IP = "0.0.0.0"

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())




app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use('/files', express.static(path.resolve(__dirname, '..', '..')))

app.use('/',routes)

app.get('/test', (req, res) => res.json({
    status: 'API funcionando com sucesso.'
}));

io.on('connection', sock => {
    console.log(`ID: ${sock.id} entrou`)

    sock.on('event', data => {
        console.log(data)
    });

    sock.on('disconnect', () => {
        console.log(`ID: ${sock.id} saiu`)
    });
});

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

server.listen(PORT,IP);
console.log(`O servidor está rodando na porta ${IP} ${PORT} `)