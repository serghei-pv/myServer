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
    let backup;
    let allQuizzes;
    let participantsArray = [];
    let roomArray = [];
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
    app.post("/quizList", (req, res) => {
        getQuizAll().then(function (data) {
            res.send(JSON.stringify(data));
            for (let key in data) {
                let userlist = [];
                for (let user in participantsArray) {
                    if (JSON.stringify(data[key]._id) == JSON.stringify(participantsArray[user].roomnumber)) {
                        userlist.push(participantsArray[user].username);
                    }
                }
                let room = { roomnumber: JSON.parse(JSON.stringify(allQuizzes[key]._id)), userlist: userlist };
                roomArray[key] = room;
            }
        });
    });
    app.post("/participant", (req) => {
        let counter = 0;
        for (let key in participantsArray) {
            if (participantsArray[key].username == req.body.username) {
                counter++;
            }
        }
        if (counter == 0) {
            participantsArray.push({
                username: req.body.username,
                points: 0,
                answer: "",
                roomnumber: req.body.roomnumber,
                lock: "false",
            });
            backup.insertOne({
                username: req.body.username,
                points: 0,
                answer: [],
                roomnumber: req.body.roomnumber,
                lock: "false",
            });
        }
    });
    app.post("/answer", (req) => {
        for (let key in participantsArray) {
            if (participantsArray[key].username == req.body.username) {
                participantsArray[key].answer = req.body.answer;
                participantsArray[key].lock = "true";
            }
        }
    });
    app.post("/continue", () => {
        for (let key in participantsArray) {
            backup.updateOne({ username: participantsArray[key].username }, {
                $set: {
                    points: participantsArray[key].points,
                    roomnumber: participantsArray[key].roomnumber,
                    lock: participantsArray[key].lock,
                },
                $push: {
                    answer: participantsArray[key].answer,
                },
            });
            participantsArray[key].lock = "false";
            participantsArray[key].answer = "";
        }
    });
    wss.on("connection", async (socket) => {
        socket.on("message", async (message) => {
            for (let key in participantsArray) {
                if (JSON.parse(message.toLocaleString()).username == participantsArray[key].username) {
                    if (JSON.parse(message.toLocaleString()).points != null) {
                        participantsArray[key].points += JSON.parse(message.toLocaleString()).points;
                    }
                    if (JSON.parse(message.toLocaleString()).lock != null && participantsArray[key].lock != "false") {
                        participantsArray[key].lock = JSON.parse(message.toLocaleString()).lock;
                        participantsArray[key].answer = "";
                    }
                }
            }
        });
    });
    setInterval(() => {
        wss.clients.forEach(async (wss) => {
            wss.send(JSON.stringify(participantsArray));
        });
    }, 100);
    async function connectToDb() {
        await dbClient.connect();
        userbase = dbClient.db("nerdquiz").collection("user");
        quiz = dbClient.db("nerdquiz").collection("quizzes");
        backup = dbClient.db("nerdquiz").collection("backup");
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
})(nerdquiz = exports.nerdquiz || (exports.nerdquiz = {}));
//# sourceMappingURL=server.js.map