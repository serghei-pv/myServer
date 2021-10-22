"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const Express = require("express");
const Cors = require("cors");
const db_1 = require("../database/db");
exports.app = Express();
exports.app.use(Cors());
exports.app.use(Express.json());
exports.app.post("/register", (req, res) => {
    db_1.getUser(req.body.username).then(function (data) {
        if (data.username != req.body.username) {
            db_1.userbase.insertOne({
                username: req.body.username,
                password: req.body.password,
                wins: 0,
                losses: 0,
                lastWin: false,
                lastLoss: false,
            });
            res.status(200).send(req.body.username);
        }
        else {
            res.status(401).send();
        }
    });
});
exports.app.post("/login", (req, res) => {
    db_1.getUser(req.body.username).then(function (data) {
        if (data.username == req.body.username && data.password == req.body.password) {
            res.status(200).send(data.username);
        }
        else {
            res.status(401).send();
        }
    });
});
exports.app.post("/user", (_req, res) => {
    db_1.getAllUser().then(function (data) {
        res.status(200).send(data);
    });
});
exports.app.post("/save", (req, res) => {
    db_1.getQuiz(req.body.username).then(function (data) {
        if (data != null && data.username == req.body.username) {
            db_1.quizzes.updateOne({ _id: data._id }, { $set: { question: req.body.question, answer: req.body.answer } });
        }
        else {
            db_1.quizzes.insertOne({ question: req.body.question, answer: req.body.answer, ready: "false", username: req.body.username });
        }
        res.status(200).send("Saved successfully");
    });
});
exports.app.post("/create", (req, res) => {
    db_1.getQuiz(req.body.username).then(function (data) {
        if (data.username == req.body.username) {
            db_1.quizzes.updateOne({ _id: data._id }, { $set: { question: req.body.question, answer: req.body.answer, ready: "true" } });
        }
        else {
            db_1.quizzes.insertOne({ question: req.body.question, answer: req.body.answer, ready: "true", username: req.body.username });
        }
        res.status(200).send("Quiz created successfully");
    });
});
exports.app.post("/load", (_req, res) => {
    db_1.getCreateQuiz().then(function (data) {
        if (data.length > 0) {
            res.status(200).send(JSON.stringify(data));
        }
        else {
            res.status(200).send([]);
        }
    });
});
exports.app.post("/list", (req, res) => {
    db_1.getAllQuizzes().then(function (data) {
        if (req.body.id == undefined) {
            res.status(200).send(JSON.stringify(data));
        }
        else {
            for (let key in data) {
                if (data[key]._id == req.body.id) {
                    res.status(200).send(JSON.stringify(data[key]));
                }
            }
        }
    });
});
//# sourceMappingURL=server.js.map