import { ObjectId } from "mongodb";

export interface User {
  _id: ObjectId;
  username: string;
  password: string;
  wins: number;
  losses: number;
  lastWin: boolean;
  lastLoss: boolean;
}

export interface Quiz {
  _id: ObjectId;
  question: string[];
  answer: string[];
  username: string;
  ready: string;
}

export interface Participant {
  username: string;
  points: number;
  answer: string;
  roomnumber: string | string[];
  lock: string;
}
