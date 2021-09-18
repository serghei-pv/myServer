import * as Http from "http";
import * as Url from "url";
import * as Mongo from "mongodb";
import * as Websocket from "ws";
import { User, Quiz, Participant, Room } from "../js/interface";

export namespace nerdquiz {
  //let dbURL: string = "mongodb://localhost:27017";
  let dbURL: string = "mongodb+srv://userGIS:GISecure@clusterraster.u3qcg.mongodb.net";

  let port: number = Number(process.env.PORT);
  if (!port) port = 8100;
  let userbase: Mongo.Collection;
  let quiz: Mongo.Collection;
  let backup: Mongo.Collection;
  let allUser: User[];
  let allQuizzes: Quiz[];
  let participantsArray: Participant[] = [];
  let roomArray: Room[] = [];

  console.log("Starting server");
  let server: Http.Server = Http.createServer();
  server.addListener("listening", handleListen);
  server.addListener("request", handleRequest);
  server.listen(port);

  connectToDb(dbURL);
  let wss = new Websocket.Server({ server });

  async function connectToDb(_url: string): Promise<void> {
    let options: Mongo.MongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };
    let mongoClient: Mongo.MongoClient = new Mongo.MongoClient(_url, options);
    await mongoClient.connect();

    userbase = mongoClient.db("nerdquiz").collection("user");
    quiz = mongoClient.db("nerdquiz").collection("quizzes");
    backup = mongoClient.db("nerdquiz").collection("backup");
  }

  function handleListen(): void {
    console.log("Looking for Action");
  }

  wss.on("connection", async (socket) => {
    console.log("User Connected");

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

    socket.on("close", () => {
      console.log("User Disconnected");
    });
  });

  setInterval(() => {
    wss.clients.forEach(async (wss) => {
      wss.send(JSON.stringify(participantsArray));
    });
  }, 100);

  async function handleRequest(_request: Http.IncomingMessage, _response: Http.ServerResponse): Promise<void> {
    console.log("Action recieved");
    _response.setHeader("Access-Control-Allow-Origin", "*");
    _response.setHeader("content-type", "text/html; charset=utf-8");

    if (_request.url) {
      let url: Url.UrlWithParsedQuery = Url.parse(_request.url, true);
      let userbaseCursor: Mongo.Cursor = userbase.find();
      let allQuizzesCursor: Mongo.Cursor = quiz.find();
      allUser = await userbaseCursor.toArray();
      allQuizzes = await allQuizzesCursor.toArray();

      if (url.pathname == "/login") {
        let counter: number = 0;

        for (let i in allUser) {
          if (allUser[i].username == url.query.username) {
            if (allUser[i].password == url.query.password) {
              _response.write(url.query.username);
              break;
            } else {
              _response.write("Wrong username or password!");
              break;
            }
          }
          counter++;

          if (counter == allUser.length) {
            _response.write("Wrong username or password!");
          }
        }
      }

      if (url.pathname == "/register") {
        if (allUser.length == 0) {
          userbase.insertOne(url.query);
          _response.write(url.query.username);
        } else {
          for (let key in allUser) {
            if (allUser[key].username == url.query.username) {
              _response.write("Username already exists!");
              break;
            }

            if (allUser[key].username != url.query.username) {
              userbase.insertOne(url.query);
              _response.write(url.query.username);
              break;
            }
          }
        }
      }

      if (url.pathname == "/create") {
        let status: number = 0;

        for (let key in allQuizzes) {
          if (allQuizzes[key].user == url.query.user && allQuizzes[key].ready == "false") {
            quiz.updateOne({ _id: allQuizzes[key]._id }, { $set: { question: url.query.q, answer: url.query.a, ready: url.query.ready } });
            status = 1;
          }
        }
        if (status == 0) {
          quiz.insertOne(url.query);
        }
      }

      if (url.pathname == "/save") {
        let status: number = 0;

        for (let key in allQuizzes) {
          if (allQuizzes[key].user == url.query.user && allQuizzes[key].ready == "false") {
            quiz.updateOne({ _id: allQuizzes[key]._id }, { $set: { question: url.query.q, answer: url.query.a } });
            status = 1;
          }
        }
        if (status == 0) {
          quiz.insertOne(url.query);
        }
      }

      if (url.pathname == "/load") {
        _response.setHeader("content-type", "application/json");
        let localQuiz: Quiz = null;
        for (let key in allQuizzes) {
          if (allQuizzes[key].user == url.query.user && allQuizzes[key].ready == "false") {
            localQuiz = allQuizzes[key];
            _response.write(JSON.stringify(localQuiz));
          }
        }
        if (localQuiz == null) {
          _response.write("0");
        }
      }

      if (url.pathname == "/quizList") {
        _response.setHeader("content-type", "application/json");
        _response.write(JSON.stringify(allQuizzes));

        for (let key in allQuizzes) {
          let userlist: string[] = [];

          for (let user in participantsArray) {
            if (JSON.stringify(allQuizzes[key]._id) == JSON.stringify(participantsArray[user].roomnumber)) {
              userlist.push(participantsArray[user].username);
            }
          }

          let room: Room = { roomnumber: JSON.parse(JSON.stringify(allQuizzes[key]._id)), userlist: userlist };
          roomArray[key] = room;
        }
      }

      if (url.pathname == "/participant") {
        let counter: number = 0;

        for (let key in participantsArray) {
          if (participantsArray[key].username == url.query.username) {
            counter++;
          }
        }

        if (counter == 0) {
          participantsArray.push({
            username: JSON.parse(JSON.stringify(url.query.username)),
            points: 0,
            answer: "",
            roomnumber: url.query.roomnumber,
            lock: "false",
          });
          backup.insertOne({
            username: JSON.parse(JSON.stringify(url.query.username)),
            points: 0,
            answer: [],
            roomnumber: url.query.roomnumber,
            lock: "false",
          });
        }
      }

      if (url.pathname == "/answer") {
        for (let key in participantsArray) {
          if (participantsArray[key].username == url.query.username) {
            participantsArray[key].answer = url.query.answer.toLocaleString();
            participantsArray[key].lock = "true";
          }
        }
      }

      if (url.pathname == "/continue") {
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
      }

      _response.end();
    }
  }
}
