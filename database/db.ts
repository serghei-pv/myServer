import * as Mongo from "mongodb";
import { Quiz } from "../interface/interface";

const url: string = "mongodb+srv://userGIS:GISecure@clusterraster.u3qcg.mongodb.net";
const client: Mongo.MongoClient = new Mongo.MongoClient(url);

connectToDb();

async function connectToDb() {
  await client.connect();
  userbase = client.db("nerdquiz").collection("user");
  quiz = client.db("nerdquiz").collection("quizzes");
}

export let userbase: Mongo.Collection;
export let quiz: Mongo.Collection;
let allQuizzes: Quiz[];

export async function getUser(username: string) {
  try {
    let findUser: Mongo.Document = <Mongo.Document>await userbase.findOne({
      username: username,
    });
    return [findUser.username, findUser.password];
  } catch (e) {
    return "noGet";
  }
}
export async function getUserAll() {
  try {
    let findUser: Mongo.Document = <Mongo.Document>userbase.find({});
    let allUser: any[] = await findUser.toArray();
    return allUser;
  } catch (e) {
    return "noGet";
  }
}

export async function getQuiz(username: string) {
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

export async function getQuizQA() {
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

export async function getQuizAll() {
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
