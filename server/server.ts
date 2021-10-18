import * as Mongo from "mongodb";
import * as Http from "http";
import Express from "express";
import Next from "next";
import Cors from "cors";
import { NextServer } from "next/dist/server/next";
import { Server } from "socket.io";
import { Quiz, Participant } from "./interface";

const port: number = parseInt(process.env.PORT || "8100", 10);
const dev: boolean = process.env.NODE_ENV !== "production";
const nextApp: NextServer = Next({ dev });
const handle = nextApp.getRequestHandler();
const dbURL: string = "mongodb+srv://userGIS:GISecure@clusterraster.u3qcg.mongodb.net";
const dbClient: Mongo.MongoClient = new Mongo.MongoClient(dbURL);

connectToDb();

let userbase: Mongo.Collection;
let quiz: Mongo.Collection;
let allQuizzes: Quiz[];
let participantsArray: Participant[] = [];

nextApp.prepare().then(() => {
  const app = Express();
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

  const server: Http.Server = Http.createServer(app);
  const io: Server = new Server(server, {
    cors: {
      allowedHeaders: ["*"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("message", (message) => {
      let data = JSON.parse(message.toLocaleString());

      switch (data.type) {
        case "host":
          socket.join(data.roomnumber);
          break;

        case "participant":
          if (data.username != null) {
            let counter: number = 0;
            let participant: Participant = {
              username: data.username,
              points: 0,
              answer: "",
              roomnumber: data.roomnumber,
              lock: "false",
            };
            socket.join(data.roomnumber);

            for (let key in participantsArray) {
              if (participantsArray[key].username == data.username) {
                counter++;
                if (counter == 1 && participantsArray[key].roomnumber != data.roomnumber) {
                  participantsArray[key] = participant;
                }
              }
            }
            if (counter == 0) {
              participantsArray.push(participant);
            }
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

        case "continue":
          for (let key in participantsArray) {
            if (participantsArray[key].roomnumber == data.roomnumber) {
              participantsArray[key].lock = "false";
              participantsArray[key].answer = "";
            }
          }
          break;

        case "finish":
          let leader: Participant = participantsArray[0];
          let loser: Participant = participantsArray[0];

          for (let key in participantsArray) {
            userbase.updateOne({ username: participantsArray[key].username }, { $set: { lastWin: false, lastLoss: false } });
            if (participantsArray[key].roomnumber == data.roomnumber) {
              if (participantsArray[key].points > leader.points) {
                leader = participantsArray[key];
              }
              if (participantsArray[key].points < loser.points) {
                loser = participantsArray[key];
              }
            }
          }

          userbase.updateOne({ username: leader.username }, { $set: { lastWin: true }, $inc: { wins: +1 } });
          userbase.updateOne({ username: loser.username }, { $set: { lastLoss: true }, $inc: { losses: +1 } });
          io.to(data.roomnumber).emit("finish");
          break;
      }

      let localParticipantsArray: Participant[] = [];
      for (let key in participantsArray) {
        if (data.roomnumber == participantsArray[key].roomnumber) {
          localParticipantsArray.push(participantsArray[key]);
        }
      }

      io.to(data.roomnumber).emit("update", JSON.stringify(localParticipantsArray));
    });
  });

  app.all("*", (req, res) => handle(req, res));

  server.listen(port, () => console.log("Next server is up and running"));
});

async function connectToDb() {
  await dbClient.connect();
  userbase = dbClient.db("nerdquiz").collection("user");
  quiz = dbClient.db("nerdquiz").collection("quizzes");
}

async function getUser(username: string) {
  try {
    let findUser: Mongo.Document = <Mongo.Document>await userbase.findOne({
      username: username,
    });
    return [findUser.username, findUser.password];
  } catch (e) {
    return "noGet";
  }
}
async function getUserAll() {
  try {
    let findUser: Mongo.Document = <Mongo.Document>userbase.find({});
    let allUser: any[] = await findUser.toArray();
    return allUser;
  } catch (e) {
    return "noGet";
  }
}

async function getQuiz(username: string) {
  try {
    let findQuiz: Mongo.Document = <Mongo.Document>await quiz.findOne({
      username: username,
      ready: "false",
    });
    return findQuiz._id;
  } catch (e) {
    return "noGet";
  }
}

async function getQuizQA() {
  try {
    let findQuiz: Mongo.Document = <Mongo.Document>quiz.find({
      ready: "false",
    });
    let unfinishedQuiz: Quiz[] = await findQuiz.toArray();
    return unfinishedQuiz;
  } catch (e) {
    return "noGet";
  }
}

async function getQuizAll() {
  try {
    let findQuiz: Mongo.Document = <Mongo.Document>quiz.find({
      ready: "true",
    });
    allQuizzes = await findQuiz.toArray();
    return allQuizzes;
  } catch (e) {
    let noGet: Quiz[] = [];
    return noGet;
  }
}
