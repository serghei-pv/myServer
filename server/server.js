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
        if (data == "noGet") {
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
            res.status(401).send("");
        }
    });
});
exports.app.post("/login", (req, res) => {
    db_1.getUser(req.body.username).then(function (data) {
        if (data[0] == req.body.username && data[1] == req.body.password) {
            res.status(200).send(data[0]);
        }
        else {
            res.status(401).send("");
        }
    });
});
exports.app.post("/user", (_req, res) => {
    db_1.getUserAll().then(function (data) {
        res.status(200).send(data);
    });
});
exports.app.post("/save", (req, res) => {
    db_1.getQuiz(req.body.username).then(function (data) {
        if (data != "noGet") {
            db_1.quiz.updateOne({ _id: data }, { $set: { question: req.body.question, answer: req.body.answer } });
            res.status(200).send("Saved successfully");
        }
        else {
            db_1.quiz.insertOne({ question: req.body.question, answer: req.body.answer, ready: "false", username: req.body.username });
        }
    });
});
exports.app.post("/create", (req, res) => {
    db_1.getQuiz(req.body.username).then(function (data) {
        if (data != "noGet") {
            db_1.quiz.updateOne({ _id: data }, { $set: { question: req.body.question, answer: req.body.answer, ready: "true" } });
            res.status(200).send("Quiz created successfully");
        }
        else {
            db_1.quiz.insertOne({ question: req.body.question, answer: req.body.answer, ready: "true", username: req.body.username });
            res.status(200).send("Quiz created successfully");
        }
    });
});
exports.app.post("/load", (_req, res) => {
    db_1.getQuizQA().then(function (data) {
        if (data != "noGet") {
            res.status(200).send(JSON.stringify(data));
        }
        else {
            res.status(200).send([]);
        }
    });
});
exports.app.post("/list", (req, res) => {
    db_1.getQuizAll().then(function (data) {
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