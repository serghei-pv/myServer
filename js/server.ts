import * as express from "express";
import * as cors from "cors";
import * as Mongo from "mongodb";
import * as Http from "http";
import * as Websocket from "ws";
import { Quiz, Participant } from "../js/interface";

export namespace nerdquiz {
  let dbURL: string = "mongodb+srv://userGIS:GISecure@clusterraster.u3qcg.mongodb.net";
  let dbClient: Mongo.MongoClient = new Mongo.MongoClient(dbURL);
  let port: number = Number(process.env.PORT);
  if (!port) port = 8100;
  let userbase: Mongo.Collection;
  let quiz: Mongo.Collection;
  let allQuizzes: Quiz[];
  let participantsArray: Participant[] = [];

  connectToDb();
  let app = express();
  app.use(cors());
  app.use(express.json());
  let server: Http.Server = Http.createServer(app);
  server.listen(port, () => console.log("A wild connection appeared!"));
  let wss = new Websocket.Server({ server });

  app.post("/login", (req, res) => {
    getUser(req.body.username).then(function (data) {
      if (data != "noGet") {
        res.send(req.body.username);
      }
    });
  });

  app.post("/save", (req, res) => {
    console.log("0");
    getQuiz(req.body.username).then(function (data) {
      console.log("1");
      if (data != "noGet") {
        console.log("2");
        quiz.updateOne({ _id: data }, { $set: { question: req.body.question, answer: req.body.answer } });
        res.send("saved succesfully");
      } else {
        quiz.insertOne({ question: req.body.question, answer: req.body.answer, ready: "false", username: req.body.username });
      }
    });
  });

  app.post("/create", (req, res) => {
    getQuiz(req.body.username).then(function (data) {
      if (data != "noGet") {
        quiz.updateOne({ _id: data }, { $set: { question: req.body.question, answer: req.body.answer, ready: "true" } });
        res.send("Quiz created succesfully");
      } else {
        quiz.insertOne({ question: req.body.question, answer: req.body.answer, ready: "true", username: req.body.username });
      }
    });
  });

  app.post("/load", (req, res) => {
    getQuizQA(req.body.username).then(function (data) {
      if (data != []) {
        res.send(JSON.stringify(data));
      } else {
        res.send("0");
      }
    });
  });

  async function connectToDb(): Promise<void> {
    await dbClient.connect();
    userbase = dbClient.db("nerdquiz").collection("user");
    quiz = dbClient.db("nerdquiz").collection("quizzes");
  }

  async function getUser(username: string): Promise<string> {
    try {
      let findUser: Mongo.Document = <Mongo.Document>await userbase.findOne({
        username: username,
      });
      return findUser.username;
    } catch (e) {
      return "noGet";
    }
  }

  async function getQuiz(username: string): Promise<string> {
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

  async function getQuizQA(username: string): Promise<string[]> {
    try {
      let findQuiz: Mongo.Document = <Mongo.Document>await quiz.findOne({
        username: username,
        ready: "false",
      });
      return [findQuiz.question, findQuiz.answer];
    } catch (e) {
      let noGet: string[] = [];
      return noGet;
    }
  }

  async function getQuizAll(): Promise<Quiz[]> {
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

  wss.on("connection", async (socket: Websocket) => {
    socket.on("message", async (message: Websocket.Data) => {
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
          let counter: number = 0;

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

      wss.clients.forEach(async (socket: Websocket) => {
        socket.send(JSON.stringify(participantsArray));
      });
    });
  });
}
