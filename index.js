var app = require('express')();
var express = require("express");
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.json())
app.use(express.static(__dirname + '/'));
app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
    
    console.log(socket.id + ' connected');

    socket.on('disconnect', () => {
        console.log(socket.id + ' disconnected');
        //removeUser(socket.id);
        //io.emit('read users');
    });

    /*
    socket.on('userChange', (user) => {
        io.emit('userChange', user);
        username = username + user;
        console.log('New user: ' + user);
        addUser(user, socket.id);
        io.emit('read users');
    });
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
        console.log(msg);
    });
    socket.on('new message', () => {
        io.emit('new message');
    });

    socket.on('add new message', (username, message) => {
        //let user = getUsername(socket.id);
        let messageTime = new Date();
        addMessage(username, socket.id, message, messageTime);
    });
    */

    //New Contact code
    socket.on('add new contact', (fromcallsign,tocallsign,date,band,mode,country,state,notes) => {
        addContact(fromcallsign,tocallsign,date,band,mode,country,state,notes);
    });

    socket.on('read contacts', (fromcallsign) => {
        let result = readContacts(fromcallsign);
        console.log(result);
        io.emit('display contacts', result);
    });

});

// Databasse info
const { Pool } = require('pg')
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ARCL-users',
    password: 'Password#123',
    port: 5432,
})

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/logbook.html', (req, res) => {
    res.sendFile(__dirname + '/logbook.html');
  });

/*
app.get("/users", async (req, res) => {
    const rows = await readUsers();
    res.setHeader("content-type", "application/json")
    res.send(JSON.stringify(rows))
})

app.post("/users", async (req, res) => {
    let result = {}
    try{
        const reqJson = req.body;
        result.success = await addUser(reqJson.username, reqJson.socketid)
    }
    catch(e){
        result.success=false;
    }
    finally{
        res.setHeader("content-type", "application/json")
        res.send(JSON.stringify(result))
    }
})
*/

// NEW Contact code
app.get("/contacts", async (req, res) => {
    const rows = await readContacts();
    res.setHeader("content-type", "application/json")
    res.send(JSON.stringify(rows))
})

app.post("/contacts", async (req, res) => {
    let result = {}
    try{
        const reqJson = req.body;
        result.success = await addContact(reqJson.fromcallsign,reqJson.tocallsign,reqJson.date,reqJson.band,reqJson.mode,reqJson.country,reqJson.state,reqJson.notes)
    }
    catch(e){
        result.success=false;
    }
    finally{
        res.setHeader("content-type", "application/json")
        res.send(JSON.stringify(result))
    }
})

/*
app.delete("/users", async (req, res) => {
    let result = {}
    try{
        const reqJson = req.body;
        result.success = await deleteTodo(reqJson.id)
    }
    catch(e){
        result.success=false;
    }
    finally{
        res.setHeader("content-type", "application/json")
        res.send(JSON.stringify(result))
    }
})
*/

http.listen(3000, () => console.log("Web server is listening.. on port 3000"))

start()

async function start() {
    await connect();
}

async function connect() {
    try {
        await pool.connect();
    }
    catch(e) {
        console.error(`Failed to connect ${e}`)
    }
}

/*
async function readUsers() {
    try {
    const results = await pool.query("select username, socketid, id from users");
    return results.rows;
    }
    catch(e){
        return [];
    }
}

async function addUser(username, sID){
    try {
        await pool.query("insert into users values ($1, $2)", [username, sID]);
        return true
    }
    catch(e){
        return false;
    }
}

async function removeUser(sID){
    try {
        await pool.query("delete from users where socketid = $1", [sID]);
        return true
    }
    catch(e){
        return false;
    }
}

*/

// *******************************
// Messages functions
//********************************
/*
app.get("/messages", async (req, res) => {
    const rows = await readMessages();
    res.setHeader("content-type", "application/json")
    res.send(JSON.stringify(rows))
})

app.post("/messages", async (req, res) => {
    let result = {}
    try{
        const reqJson = req.body;
        result.success = await addMessage(reqJson.username, reqJson.socketid, reqJson.messagebody, reqJson.timestamp);
    }
    catch(e){
        result.success=false;
    }
    finally{
        res.setHeader("content-type", "application/json")
        res.send(JSON.stringify(result))
    }
})

async function readMessages() {
    try {
    const results = await pool.query("select username, socketid, messagebody, timestamp from messages");
    return results.rows;
    }
    catch(e){
        return [];
    }
}

async function addMessage(username, sID, message, timestamp){
    try {
        await pool.query("insert into messages values ($1, $2, $3, $4)", [username, sID, message, timestamp]);
        return true;
    } catch(e){
        console.log(`Adding message failed ${e}`);
        return false;
    }
}

async function getUsername(sID){
    try {
        const username = await pool.query("select username from users where socketid = ($1)", [sID]);
        return username;
    } catch(e){
        console.log(`getUsername failed! ${e}`);
        return false;
    }
}
*/

// NEW Contact Code
async function addContact(fromcallsign,tocallsign,date,band,mode,country,state,notes){
    try {
        await pool.query("insert into logs values ($1, $2, $3, $4, $5, $6, $7, $8)", [fromcallsign,tocallsign,date,band,mode,country,state,notes]);
        return true;
    } catch(e){
        console.log(`Adding message failed ${e}`);
        return false;
    }
}

async function readContacts(fromcallsign) {
    try {
        const x = "'" + fromcallsign + "'";
        console.log(x);
        const results = await pool.query("select fromcallsign, tocallsign, date, band, mode, country, state, notes from logs where fromcallsign = ($1)", [x]);
        console.log(results.rows);
        return results.rows;
    }
    catch(e){
        return [];
    }
}

async function readContacts() {
    try {
        const results = await pool.query("select fromcallsign, tocallsign, date, band, mode, country, state, notes from logs");
        return results.rows;
    }
    catch(e){
        return [];
    }
}

app.on('exit', function(){
    pool.end();
})
