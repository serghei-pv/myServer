"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nerdquiz = void 0;
const express = require("express");
const cors = require("cors");
const Mongo = require("mongodb");
const Http = require("http");
const Websocket = require("ws");
var nerdquiz;
(function (nerdquiz) {
    let dbURL = "mongodb+srv://userGIS:GISecure@clusterraster.u3qcg.mongodb.net";
    let dbClient = new Mongo.MongoClient(dbURL);
    let port = Number(process.env.PORT);
    if (!port)
        port = 8100;
    let userbase;
    let quiz;
    let allQuizzes;
    let participantsArray = [];
    connectToDb();
    let app = express();
    app.use(cors());
    app.use(express.json());
    let server = Http.createServer(app);
    server.listen(port, () => console.log("A wild connection appeared!"));
    let wss = new Websocket.Server({ server });
    app.post("/login", (req, res) => {
        getUser(req.body.username).then(function (data) {
            if (data != null) {
                res.send(req.body.username);
            }
        });
    });
    app.post("/save", (req, res) => {
        getQuiz(req.body.username).then(function (data) {
            if (data != null) {
                quiz.updateOne({ _id: data }, { $set: { question: req.body.question, answer: req.body.answer } });
                res.send("saved succesfully");
            }
            else {
                quiz.insertOne({ username: req.body.username, question: req.body.question, answer: req.body.answer, ready: "false" });
            }
        });
    });
    app.post("/create", (req, res) => {
        getQuiz(req.body.username).then(function (data) {
            if (data != null) {
                quiz.updateOne({ _id: data }, { $set: { question: req.body.question, answer: req.body.answer, ready: "true" } });
                res.send("quiz created succesfully");
            }
            else {
                quiz.insertOne({ username: req.body.username, question: req.body.question, answer: req.body.answer, ready: "true" });
            }
        });
    });
    app.post("/load", (req, res) => {
        getQuizQA(req.body.username).then(function (data) {
            if (data != null) {
                res.send(JSON.stringify(data));
            }
            else {
                res.send("0");
            }
        });
    });
    async function connectToDb() {
        await dbClient.connect();
        userbase = dbClient.db("nerdquiz").collection("user");
        quiz = dbClient.db("nerdquiz").collection("quizzes");
    }
    async function getUser(user) {
        try {
            let findUser = await userbase.findOne({
                username: user,
            });
            return findUser.username;
        }
        catch (e) {
            return null;
        }
    }
    async function getQuiz(user) {
        try {
            let findQuiz = await quiz.findOne({
                user: user,
                ready: "false",
            });
            return findQuiz._id;
        }
        catch (e) {
            return null;
        }
    }
    async function getQuizQA(user) {
        try {
            let findQuiz = await quiz.findOne({
                user: user,
                ready: "false",
            });
            return [findQuiz.question, findQuiz.answer];
        }
        catch (e) {
            return null;
        }
    }
    async function getQuizAll() {
        try {
            let findQuiz = quiz.find({
                ready: "true",
            });
            allQuizzes = await findQuiz.toArray();
            return allQuizzes;
        }
        catch (e) {
            return null;
        }
    }
    wss.on("connection", async (socket) => {
        socket.on("message", async (message) => {
            let data = JSON.parse(message.toLocaleString());
            switch (data.type) {
                case "change":
                    for (let key in participantsArray) {
                        if (data.username == participantsArray[key].username) {
                            if (data.points != null) {
                                participantsArray[key].points += data.points;
                            }
                            if (data.lock != null && participantsArray[key].lock != "false") {
                                participantsArray[key].lock = data.lock;
                                participantsArray[key].answer = "";
                            }
                        }
                    }
                    break;
                case "quizList":
                    getQuizAll().then(function (data) {
                        socket.send(JSON.stringify(data));
                    });
                    break;
                case "participant":
                    let counter = 0;
                    for (let key in participantsArray) {
                        if (participantsArray[key].username == data.username) {
                            counter++;
                            if (counter == 1 && participantsArray[key].roomnumber != data.roomnumber) {
                                participantsArray[key] = {
                                    username: data.username,
                                    points: 0,
                                    answer: "",
                                    roomnumber: data.roomnumber,
                                    lock: "false",
                                };
                            }
                        }
                    }
                    if (counter == 0) {
                        participantsArray.push({
                            username: data.username,
                            points: 0,
                            answer: "",
                            roomnumber: data.roomnumber,
                            lock: "false",
                        });
                    }
                    break;
                case "answer":
                    for (let key in participantsArray) {
                        if (participantsArray[key].username == data.username) {
                            participantsArray[key].answer = data.answer;
                            participantsArray[key].lock = "true";
                        }
                    }
                    break;
                case "continue":
                    for (let key in participantsArray) {
                        participantsArray[key].lock = "false";
                        participantsArray[key].answer = "";
                    }
            }
            wss.clients.forEach(async (socket) => {
                socket.send(JSON.stringify(participantsArray));
            });
        });
    });
})(nerdquiz = exports.nerdquiz || (exports.nerdquiz = {}));
//# sourceMappingURL=server.js.map