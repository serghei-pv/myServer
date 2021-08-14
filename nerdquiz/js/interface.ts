import { ObjectId } from "mongodb";

export interface User {
  _id: ObjectId;
  username: string;
  password: string;
}

export interface Quiz {
  _id: ObjectId;
  question: string[];
  answer: string[];
  user: string;
}

export interface Participant {
  username: string | string[];
  points: number;
  answer: string;
}
