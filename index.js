require('dotenv').config();
const APIAI_TOKEN = process.env.APIAI_TOKEN;
const APIAI_SESSION_ID = process.env.APIAI_SESSION_ID;

const express = require("express");
const apiai = require('apiai')(APIAI_TOKEN);
const url = require('url');

const app = express();

app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/public'));

app.get("/", (req, res)=> {
    console.log("entered / route");
    var q = url.parse(req.url, true);
    console.log('url', q);
    res.sendFile('index.html');
});

const server = app.listen(process.env.PORT || 5000, () => {
    console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

const io = require('socket.io')(server);
    
io.on("connection", (socket) => {
    socket.on("chat message", (text) => {

        let apiaiReq = apiai.textRequest(text, {
            sessionId: APIAI_SESSION_ID
        });

        apiaiReq.on('response', (res) => {
            let aiText = res.result.fulfillment.speech;
            socket.emit('bot reply', aiText); // Send the result back to the browser!
        });

        apiaiReq.on('error', (err) => {
            console.log(err);
        });

        apiaiReq.end();
    });

});
