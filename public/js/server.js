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
    let winner;
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
            if (data == req.body.username) {
                res.send(req.body.username);
            }
        });
    });
    app.post("/save", (req, res) => {
        getQuiz(req.body.username).then(function (data) {
            if (data != "noGet") {
                quiz.updateOne({ _id: data }, { $set: { question: req.body.question, answer: req.body.answer } });
                res.send("saved succesfully");
            }
            else {
                quiz.insertOne({ question: req.body.question, answer: req.body.answer, ready: "false", username: req.body.username });
            }
        });
    });
    app.post("/create", (req, res) => {
        getQuiz(req.body.username).then(function (data) {
            if (data != "noGet") {
                quiz.updateOne({ _id: data }, { $set: { question: req.body.question, answer: req.body.answer, ready: "true" } });
                res.send("Quiz created succesfully");
            }
            else {
                quiz.insertOne({ question: req.body.question, answer: req.body.answer, ready: "true", username: req.body.username });
            }
        });
    });
    app.post("/load", (req, res) => {
        getQuizQA(req.body.username).then(function (data) {
            if (data != []) {
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
        winner = dbClient.db("nerdquiz").collection("misc");
    }
    async function getUser(username) {
        try {
            let findUser = await userbase.findOne({
                username: username,
            });
            return findUser.username;
        }
        catch (e) {
            return "noGet";
        }
    }
    async function getQuiz(username) {
        try {
            let findQuiz = await quiz.findOne({
                username: username,
                ready: "false",
            });
            return findQuiz._id;
        }
        catch (e) {
            return "noGet";
        }
    }
    async function getQuizQA(username) {
        try {
            let findQuiz = await quiz.findOne({
                username: username,
                ready: "false",
            });
            return [findQuiz.question, findQuiz.answer];
        }
        catch (e) {
            let noGet = [];
            return noGet;
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
            let noGet = [];
            return noGet;
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
                    break;
                case "winner":
                    let leader = {
                        username: "",
                        points: 0,
                        answer: "",
                        roomnumber: "",
                        lock: "",
                    };
                    for (let key in participantsArray) {
                        if (participantsArray[key].roomnumber == data.roomnumber) {
                            if (participantsArray[key].points > leader.points) {
                                leader = participantsArray[key];
                            }
                        }
                    }
                    winner.updateOne({ name: "winnerArray" }, { $push: { user: leader.username } });
                    socket.send(JSON.stringify(leader));
                    break;
            }
            wss.clients.forEach(async (socket) => {
                socket.send(JSON.stringify(participantsArray));
            });
        });
    });
})(nerdquiz = exports.nerdquiz || (exports.nerdquiz = {}));
//# sourceMappingURL=server.js.map