import * as Http from "http";
import * as Url from "url";
import * as Mongo from "mongodb";
import * as Websocket from "ws";
import { User, Quiz, Participant } from "../js/interface";

export namespace nerdquiz {
  //let dbURL: string = "mongodb://localhost:27017";
  let dbURL: string = "mongodb+srv://userGIS:GISecure@clusterraster.u3qcg.mongodb.net";

  let port: number = Number(process.env.PORT);
  if (!port) port = 8100;
  let userbase: Mongo.Collection;
  let quiz: Mongo.Collection;
  let allUser: User[];
  let allQuizzes: Quiz[];
  let participantsArray: Participant[] = [];

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
  }

  function handleListen(): void {
    console.log("Looking for Action");
  }

  wss.on("connection", async (socket) => {
    console.log("User Connected");

    socket.on("message", async (message) => {
      for (let key in participantsArray) {
        if (JSON.parse(message.toLocaleString()).username == participantsArray[key].username) {
          participantsArray[key].points += JSON.parse(message.toLocaleString()).points;
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
            quiz.updateOne({ _id: allQuizzes[key]._id }, { $set: { question: url.query.question, ready: url.query.ready } });
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
            quiz.updateOne({ _id: allQuizzes[key]._id }, { $set: { question: url.query.question, answer: url.query.answer } });
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
      }

      if (url.pathname == "/participant") {
        let counter: number = 0;

        for (let key in participantsArray) {
          if (participantsArray[key].username == url.query.username) {
            counter++;
          }

          if (counter == participantsArray.length) {
            let participant: Participant = { username: JSON.stringify(url.query.username), points: 0, answer: "No answer yet" };
            participantsArray.push(participant);
          }
        }

        if (counter == 0) {
          participantsArray.push({ username: url.query.username, points: 0, answer: "No answer yet" });
        }
      }

      if (url.pathname == "/answer") {
        for (let key in participantsArray) {
          if (participantsArray[key].username == url.query.username) {
            participantsArray[key].answer = url.query.answer.toLocaleString();
          }
        }
      }
      _response.end();
    }
  }
}
