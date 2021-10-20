import * as Express from "express";
import * as Cors from "cors";
import { getUser, getUserAll, getQuiz, getQuizQA, getQuizAll, userbase, quiz } from "../database/db";

export const app = Express();
app.use(Cors());
app.use(Express.json());

app.post("/register", (req, res) => {
  getUser(req.body.username).then(function (data) {
    if (data == "noGet") {
      userbase.insertOne({
        username: req.body.username,
        password: req.body.password,
        wins: 0,
        losses: 0,
        lastWin: false,
        lastLoss: false,
      });
      res.status(200).send(req.body.username);
    } else {
      res.status(401).send("");
    }
  });
});

app.post("/login", (req, res) => {
  getUser(req.body.username).then(function (data) {
    if (data[0] == req.body.username && data[1] == req.body.password) {
      res.status(200).send(data[0]);
    } else {
      res.status(401).send("");
    }
  });
});

app.post("/user", (_req, res) => {
  getUserAll().then(function (data) {
    res.status(200).send(data);
  });
});

app.post("/save", (req, res) => {
  getQuiz(req.body.username).then(function (data) {
    if (data != "noGet") {
      quiz.updateOne({ _id: data }, { $set: { question: req.body.question, answer: req.body.answer } });
      res.status(200).send("Saved successfully");
    } else {
      quiz.insertOne({ question: req.body.question, answer: req.body.answer, ready: "false", username: req.body.username });
    }
  });
});

app.post("/create", (req, res) => {
  getQuiz(req.body.username).then(function (data) {
    if (data != "noGet") {
      quiz.updateOne({ _id: data }, { $set: { question: req.body.question, answer: req.body.answer, ready: "true" } });
      res.status(200).send("Quiz created successfully");
    } else {
      quiz.insertOne({ question: req.body.question, answer: req.body.answer, ready: "true", username: req.body.username });
      res.status(200).send("Quiz created successfully");
    }
  });
});

app.post("/load", (_req, res) => {
  getQuizQA().then(function (data) {
    if (data != "noGet") {
      res.status(200).send(JSON.stringify(data));
    } else {
      res.status(200).send([]);
    }
  });
});

app.post("/list", (req, res) => {
  getQuizAll().then(function (data) {
    if (req.body.id == undefined) {
      res.status(200).send(JSON.stringify(data));
    } else {
      for (let key in data) {
        if (data[key]._id == req.body.id) {
          res.status(200).send(JSON.stringify(data[key]));
        }
      }
    }
  });
});
