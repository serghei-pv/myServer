import * as Http from "http";
import * as Url from "url";
import * as Mongo from "mongodb";
import { User } from "../js/interface";

export namespace nerdquiz {
  //let dbURL: string = "mongodb://localhost:27017";
  let dbURL: string = "mongodb+srv://userGIS:GISecure@clusterraster.u3qcg.mongodb.net";

  let port: number = Number(process.env.PORT);
  if (!port) port = 8100;
  let userbase: Mongo.Collection;
  let allUser: User[];

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

    userbase = mongoClient.db("bacus").collection("user");
  }

  function handleListen(): void {
    console.log("Looking for Action");
  }

  async function handleRequest(_request: Http.IncomingMessage, _response: Http.ServerResponse): Promise<void> {
    console.log("Action recieved");
    _response.setHeader("Access-Control-Allow-Origin", "*");
    _response.setHeader("content-type", "text/html; charset=utf-8");

    _response.end();
  }
}
