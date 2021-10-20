import * as Mongo from "mongodb";
import { Quiz, User } from "../interface/interface";

const url: string = "mongodb+srv://userGIS:GISecure@clusterraster.u3qcg.mongodb.net";
const client: Mongo.MongoClient = new Mongo.MongoClient(url);
export let userbase: Mongo.Collection;
export let quizzes: Mongo.Collection;

connectToDb();

async function connectToDb() {
  await client.connect();
  userbase = client.db("nerdquiz").collection("user");
  quizzes = client.db("nerdquiz").collection("quizzes");
}

export async function getUser(username: string): Promise<User> {
  let user: User = <User>await userbase.findOne({
    username: username,
  });
  return user;
}
export async function getAllUser(): Promise<User[]> {
  let userArray: User[] = <User[]>await userbase.find().toArray();
  return userArray;
}
export async function getQuiz(username: string): Promise<Quiz> {
  let quiz: Quiz = <Quiz>await quizzes.findOne({
    username: username,
    ready: "false",
  });
  return quiz;
}
export async function getCreateQuiz(): Promise<Quiz[]> {
  let quizArray: Quiz[] = <Quiz[]>await quizzes
    .find({
      ready: "false",
    })
    .toArray();
  return quizArray;
}
export async function getAllQuizzes(): Promise<Quiz[]> {
  let quizArray: Quiz[] = <Quiz[]>await quizzes
    .find({
      ready: "true",
    })
    .toArray();
  return quizArray;
}
