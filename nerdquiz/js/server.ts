import * as express from "express";
import * as cors from "cors";
import * as Mongo from "mongodb";
import * as Http from "http";
import * as Websocket from "ws";
import { Quiz, Participant, Room } from "../js/interface";

export namespace nerdquiz {
  let dbURL: string = "mongodb+srv://userGIS:GISecure@clusterraster.u3qcg.mongodb.net";
  let dbClient: Mongo.MongoClient = new Mongo.MongoClient(dbURL);
  let port: number = Number(process.env.PORT);
  if (!port) port = 8100;
  let userbase: Mongo.Collection;
  let quiz: Mongo.Collection;
  let backup: Mongo.Collection;
  let allQuizzes: Quiz[];
  let participantsArray: Participant[] = [];
  let roomArray: Room[] = [];

  connectToDb();
  let app = express();
  app.use(cors());
  app.use(express.json());
  let server: Http.Server = Http.createServer(app);
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
      } else {
        quiz.insertOne({ username: req.body.username, question: req.body.question, answer: req.body.answer, ready: "false" });
      }
    });
  });

  app.post("/create", (req, res) => {
    getQuiz(req.body.username).then(function (data) {
      if (data != null) {
        quiz.updateOne({ _id: data }, { $set: { question: req.body.question, answer: req.body.answer, ready: "true" } });
        res.send("quiz created succesfully");
      } else {
        quiz.insertOne({ username: req.body.username, question: req.body.question, answer: req.body.answer, ready: "true" });
      }
    });
  });

  app.post("/load", (req, res) => {
    getQuizQA(req.body.username).then(function (data) {
      if (data != null) {
        res.send(JSON.stringify(data));
      } else {
        res.send("0");
      }
    });
  });

  app.post("/quizList", (req, res) => {
    getQuizAll().then(function (data) {
      res.send(JSON.stringify(data));

      for (let key in data) {
        let userlist: string[] = [];

        for (let user in participantsArray) {
          if (JSON.stringify(data[key]._id) == JSON.stringify(participantsArray[user].roomnumber)) {
            userlist.push(participantsArray[user].username);
          }
        }

        let room: Room = { roomnumber: JSON.parse(JSON.stringify(allQuizzes[key]._id)), userlist: userlist };
        roomArray[key] = room;
      }
    });
  });

  app.post("/participant", (req) => {
    let counter: number = 0;

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
      backup.updateOne(
        { username: participantsArray[key].username },
        {
          $set: {
            points: participantsArray[key].points,
            roomnumber: participantsArray[key].roomnumber,
            lock: participantsArray[key].lock,
          },
          $push: {
            answer: participantsArray[key].answer,
          },
        }
      );

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

  async function connectToDb(): Promise<void> {
    await dbClient.connect();
    userbase = dbClient.db("nerdquiz").collection("user");
    quiz = dbClient.db("nerdquiz").collection("quizzes");
    backup = dbClient.db("nerdquiz").collection("backup");
  }

  async function getUser(user: string): Promise<void> {
    try {
      let findUser: Mongo.Document = await userbase.findOne({
        username: user,
      });
      return findUser.username;
    } catch (e) {
      return null;
    }
  }

  async function getQuiz(user: string): Promise<string> {
    try {
      let findQuiz: Mongo.Document = await quiz.findOne({
        user: user,
        ready: "false",
      });
      return findQuiz._id;
    } catch (e) {
      return null;
    }
  }

  async function getQuizQA(user: string): Promise<string[]> {
    try {
      let findQuiz: Mongo.Document = await quiz.findOne({
        user: user,
        ready: "false",
      });
      return [findQuiz.question, findQuiz.answer];
    } catch (e) {
      return null;
    }
  }

  async function getQuizAll(): Promise<Quiz[]> {
    try {
      let findQuiz: Mongo.Document = quiz.find({
        ready: "true",
      });
      allQuizzes = await findQuiz.toArray();
      return allQuizzes;
    } catch (e) {
      return null;
    }
  }
}
