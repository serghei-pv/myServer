import * as Http from "http";
import * as Url from "url";
import * as Mongo from "mongodb";
import { User } from "../js/interface";
import { Quiz } from "../js/interface";

export namespace nerdquiz {
  //let dbURL: string = "mongodb://localhost:27017";
  let dbURL: string = "mongodb+srv://userGIS:GISecure@clusterraster.u3qcg.mongodb.net";

  let port: number = Number(process.env.PORT);
  if (!port) port = 8100;
  let userbase: Mongo.Collection;
  let quiz: Mongo.Collection;
  let allUser: User[];
  let allQuizzes: Quiz[];

  connectToDb(dbURL);
  connectToServer(port);

  function connectToServer(_port: number): void {
    console.log("Starting server");
    let server: Http.Server = Http.createServer();
    server.addListener("listening", handleListen);
    server.addListener("request", handleRequest);
    server.listen(port);
  }

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
        quiz.insertOne(url.query);
      }

      if (url.pathname == "/quizList") {
        _response.setHeader("content-type", "application/json");
        _response.write(JSON.stringify(allQuizzes));
      }
      _response.end();
    }
  }
}
