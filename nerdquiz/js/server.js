"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nerdquiz = void 0;
const Http = require("http");
const Mongo = require("mongodb");
var nerdquiz;
(function (nerdquiz) {
    //let dbURL: string = "mongodb://localhost:27017";
    let dbURL = "mongodb+srv://userGIS:GISecure@clusterraster.u3qcg.mongodb.net";
    let port = Number(process.env.PORT);
    if (!port)
        port = 8100;
    let userbase;
    let allUser;
    connectToDb(dbURL);
    connectToServer(port);
    function connectToServer(_port) {
        console.log("Starting server");
        let server = Http.createServer();
        server.addListener("listening", handleListen);
        server.addListener("request", handleRequest);
        server.listen(port);
    }
    async function connectToDb(_url) {
        let options = { useNewUrlParser: true, useUnifiedTopology: true };
        let mongoClient = new Mongo.MongoClient(_url, options);
        await mongoClient.connect();
        userbase = mongoClient.db("bacus").collection("user");
    }
    function handleListen() {
        console.log("Looking for Action");
    }
    async function handleRequest(_request, _response) {
        console.log("Action recieved");
        _response.setHeader("Access-Control-Allow-Origin", "*");
        _response.setHeader("content-type", "text/html; charset=utf-8");
        _response.end();
    }
})(nerdquiz = exports.nerdquiz || (exports.nerdquiz = {}));
//# sourceMappingURL=server.js.map