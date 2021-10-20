"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllQuizzes = exports.getCreateQuiz = exports.getQuiz = exports.getAllUser = exports.getUser = exports.quizzes = exports.userbase = void 0;
const Mongo = require("mongodb");
const url = "mongodb+srv://userGIS:GISecure@clusterraster.u3qcg.mongodb.net";
const client = new Mongo.MongoClient(url);
connectToDb();
async function connectToDb() {
    await client.connect();
    exports.userbase = client.db("nerdquiz").collection("user");
    exports.quizzes = client.db("nerdquiz").collection("quizzes");
}
async function getUser(username) {
    let user = await exports.userbase.findOne({
        username: username,
    });
    return user;
}
exports.getUser = getUser;
async function getAllUser() {
    let userArray = await exports.userbase.find().toArray();
    return userArray;
}
exports.getAllUser = getAllUser;
async function getQuiz(username) {
    let quiz = await exports.quizzes.findOne({
        username: username,
        ready: "false",
    });
    return quiz;
}
exports.getQuiz = getQuiz;
async function getCreateQuiz() {
    let quizArray = await exports.quizzes
        .find({
        ready: "false",
    })
        .toArray();
    return quizArray;
}
exports.getCreateQuiz = getCreateQuiz;
async function getAllQuizzes() {
    let quizArray = await exports.quizzes
        .find({
        ready: "true",
    })
        .toArray();
    return quizArray;
}
exports.getAllQuizzes = getAllQuizzes;
//# sourceMappingURL=db.js.map