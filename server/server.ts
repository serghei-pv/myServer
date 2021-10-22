import * as Express from "express";
import * as Cors from "cors";
import { getUser, getAllUser, getQuiz, getCreateQuiz, getAllQuizzes, userbase, quizzes } from "../database/db";
import { User } from "../interface/interface";

export const app = Express();
app.use(Cors());
app.use(Express.json());

app.post("/register", (req, res) => {
  getUser(req.body.username).then(function (data: User) {
    if (data.username != req.body.username) {
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
      res.status(401).send();
    }
  });
});

app.post("/login", (req, res) => {
  getUser(req.body.username).then(function (data: User) {
    if (data.username == req.body.username && data.password == req.body.password) {
      res.status(200).send(data.username);
    } else {
      res.status(401).send();
    }
  });
});

app.post("/user", (_req, res) => {
  getAllUser().then(function (data) {
    res.status(200).send(data);
  });
});

app.post("/save", (req, res) => {
  getQuiz(req.body.username).then(function (data) {
    if (data != null && data.username == req.body.username) {
      quizzes.updateOne({ _id: data._id }, { $set: { question: req.body.question, answer: req.body.answer } });
    } else {
      quizzes.insertOne({ question: req.body.question, answer: req.body.answer, ready: "false", username: req.body.username });
    }
    res.status(200).send("Saved successfully");
  });
});

app.post("/create", (req, res) => {
  getQuiz(req.body.username).then(function (data) {
    if (data.username == req.body.username) {
      quizzes.updateOne({ _id: data._id }, { $set: { question: req.body.question, answer: req.body.answer, ready: "true" } });
    } else {
      quizzes.insertOne({ question: req.body.question, answer: req.body.answer, ready: "true", username: req.body.username });
    }
    res.status(200).send("Quiz created successfully");
  });
});

app.post("/load", (_req, res) => {
  getCreateQuiz().then(function (data) {
    if (data.length > 0) {
      res.status(200).send(JSON.stringify(data));
    } else {
      res.status(200).send([]);
    }
  });
});

app.post("/list", (req, res) => {
  getAllQuizzes().then(function (data) {
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
