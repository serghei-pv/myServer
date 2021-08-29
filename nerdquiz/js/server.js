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
    let allUser;
    let allQuizzes;
    let participantsArray = [];
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
    }
    function handleListen() {
        console.log("Looking for Action");
    }
    wss.on("connection", async (socket) => {
        console.log("User Connected");
        socket.on("message", async (message) => {
            for (let key in participantsArray) {
                if (JSON.parse(message.toLocaleString()).username == participantsArray[key].username) {
                    participantsArray[key].points = JSON.parse(message.toLocaleString()).points;
                }
            }
        });
        socket.on("close", () => {
            console.log("User Disconnected");
        });
    });
    setInterval(() => {
        wss.clients.forEach(async (wss) => {
            wss.send(JSON.stringify(participantsArray));
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
            if (url.pathname == "/participant") {
                let counter = 0;
                for (let key in participantsArray) {
                    if (participantsArray[key].username == url.query.username) {
                        counter++;
                    }
                    if (counter == participantsArray.length) {
                        let participant = { username: JSON.stringify(url.query.username), points: 0, answer: "No answer yet" };
                        participantsArray.push(participant);
                    }
                }
                if (counter == 0) {
                    participantsArray.push({ username: url.query.username, points: 0, answer: "No answer yet" });
                }
            }
            if (url.pathname == "/answer") {
                for (let key in participantsArray) {
                    if (participantsArray[key].username == url.query.username) {
                        participantsArray[key].answer = url.query.answer.toLocaleString();
                    }
                }
            }
            _response.end();
        }
    }
})(nerdquiz = exports.nerdquiz || (exports.nerdquiz = {}));
//# sourceMappingURL=server.js.map