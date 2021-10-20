"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuizAll = exports.getQuizQA = exports.getQuiz = exports.getUserAll = exports.getUser = exports.quiz = exports.userbase = void 0;
const Mongo = require("mongodb");
const url = "mongodb+srv://userGIS:GISecure@clusterraster.u3qcg.mongodb.net";
const client = new Mongo.MongoClient(url);
connectToDb();
async function connectToDb() {
    await client.connect();
    exports.userbase = client.db("nerdquiz").collection("user");
    exports.quiz = client.db("nerdquiz").collection("quizzes");
}
let allQuizzes;
async function getUser(username) {
    try {
        let findUser = await exports.userbase.findOne({
            username: username,
        });
        return [findUser.username, findUser.password];
    }
    catch (e) {
        return "noGet";
    }
}
exports.getUser = getUser;
async function getUserAll() {
    try {
        let findUser = exports.userbase.find({});
        let allUser = await findUser.toArray();
        return allUser;
    }
    catch (e) {
        return "noGet";
    }
}
exports.getUserAll = getUserAll;
async function getQuiz(username) {
    try {
        let findQuiz = await exports.quiz.findOne({
            username: username,
            ready: "false",
        });
        return findQuiz._id;
    }
    catch (e) {
        return "noGet";
    }
}
exports.getQuiz = getQuiz;
async function getQuizQA() {
    try {
        let findQuiz = exports.quiz.find({
            ready: "false",
        });
        let unfinishedQuiz = await findQuiz.toArray();
        return unfinishedQuiz;
    }
    catch (e) {
        return "noGet";
    }
}
exports.getQuizQA = getQuizQA;
async function getQuizAll() {
    try {
        let findQuiz = exports.quiz.find({
            ready: "true",
        });
        allQuizzes = await findQuiz.toArray();
        return allQuizzes;
    }
    catch (e) {
        let noGet = [];
        return noGet;
    }
}
exports.getQuizAll = getQuizAll;
//# sourceMappingURL=db.js.map