"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nerdquiz = void 0;
const Http = require("http");
const Url = require("url");
const Mongo = require("mongodb");
const Websocket = require("ws");
var nerdquiz;
(function (nerdquiz) {
    //let dbURL: string = "mongodb://localhost:27017";
    let dbURL = "mongodb+srv://userGIS:GISecure@clusterraster.u3qcg.mongodb.net";
    let port = Number(process.env.PORT);
    if (!port)
        port = 8100;
    let userbase;
    let quiz;
    let participants;
    let allUser;
    let allQuizzes;
    let allParticipants;
    console.log("Starting server");
    let server = Http.createServer();
    server.addListener("listening", handleListen);
    server.addListener("request", handleRequest);
    server.listen(port);
    connectToDb(dbURL);
    let wss = new Websocket.Server({ server });
    async function connectToDb(_url) {
        let options = { useNewUrlParser: true, useUnifiedTopology: true };
        let mongoClient = new Mongo.MongoClient(_url, options);
        await mongoClient.connect();
        userbase = mongoClient.db("nerdquiz").collection("user");
        quiz = mongoClient.db("nerdquiz").collection("quizzes");
        participants = mongoClient.db("nerdquiz").collection("participants");
    }
    function handleListen() {
        console.log("Looking for Action");
    }
    wss.on("connection", async (socket) => {
        console.log("User Connected");
        let particpantsCounter = 0;
        let participantsCursor = participants.find();
        allParticipants = await participantsCursor.toArray();
        socket.on("message", async (message) => {
            if (allParticipants.length > 0) {
                for (let i = allParticipants.length; i < allParticipants.length; i++) {
                    if (allParticipants[i].username != message) {
                        particpantsCounter++;
                    }
                }
                if (particpantsCounter == allParticipants.length) {
                    participants.insertOne({ number: particpantsCounter + 1, username: message });
                    console.log(message);
                    particpantsCounter = 1;
                }
            }
            else {
                participants.insertOne({ number: particpantsCounter + 1, username: message, points: 0, answer: "" });
                console.log(message);
                particpantsCounter++;
            }
        });
        socket.on("close", () => {
            console.log("User Disconnected");
        });
    });
    setInterval(() => {
        wss.clients.forEach(async (wss) => {
            let participantsCursor = participants.find();
            allParticipants = await participantsCursor.toArray();
            wss.send(JSON.stringify(allParticipants));
        });
    }, 1000);
    async function handleRequest(_request, _response) {
        console.log("Action recieved");
        _response.setHeader("Access-Control-Allow-Origin", "*");
        _response.setHeader("content-type", "text/html; charset=utf-8");
        if (_request.url) {
            let url = Url.parse(_request.url, true);
            let userbaseCursor = userbase.find();
            let allQuizzesCursor = quiz.find();
            allUser = await userbaseCursor.toArray();
            allQuizzes = await allQuizzesCursor.toArray();
            if (url.pathname == "/login") {
                let counter = 0;
                for (let i in allUser) {
                    if (allUser[i].username == url.query.username) {
                        if (allUser[i].password == url.query.password) {
                            _response.write(url.query.username);
                            break;
                        }
                        else {
                            _response.write("Wrong username or password!");
                            break;
                        }
                    }
                    counter++;
                    if (counter == allUser.length) {
                        _response.write("Wrong username or password!");
                    }
                }
            }
            if (url.pathname == "/register") {
                if (allUser.length == 0) {
                    userbase.insertOne(url.query);
                    _response.write(url.query.username);
                }
                else {
                    for (let key in allUser) {
                        if (allUser[key].username == url.query.username) {
                            _response.write("Username already exists!");
                            break;
                        }
                        if (allUser[key].username != url.query.username) {
                            userbase.insertOne(url.query);
                            _response.write(url.query.username);
                            break;
                        }
                    }
                }
            }
            if (url.pathname == "/create") {
                quiz.insertOne(url.query);
            }
            if (url.pathname == "/quizList") {
                _response.setHeader("content-type", "application/json");
                _response.write(JSON.stringify(allQuizzes));
            }
            _response.end();
        }
    }
})(nerdquiz = exports.nerdquiz || (exports.nerdquiz = {}));
//# sourceMappingURL=server.js.map