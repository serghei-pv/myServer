import * as Http from "http";
import { Server } from "socket.io";
import { app } from "../server/server";
import { Participant } from "../interface/interface";
import { userbase } from "../database/db";

const port: number = Number(process.env.PORT || "8100");
const server: Http.Server = Http.createServer(app);
server.listen(port, () => console.log("Next server is up and running"));

let participantsArray: Participant[] = [];

const io: Server = new Server(server, {
  cors: {
    allowedHeaders: ["*"],
  },
});

io.on("connection", (socket) => {
  socket.on("message", (message) => {
    let data = JSON.parse(message.toLocaleString());

    switch (data.type) {
      case "host":
        socket.join(data.roomnumber);
        break;

      case "participant":
        if (data.username != null) {
          let counter: number = 0;
          let participant: Participant = {
            username: data.username,
            points: 0,
            answer: "",
            roomnumber: data.roomnumber,
            lock: "false",
          };
          socket.join(data.roomnumber);

          for (let key in participantsArray) {
            if (participantsArray[key].username == data.username) {
              counter++;
              if (counter == 1 && participantsArray[key].roomnumber != data.roomnumber) {
                participantsArray[key] = participant;
              }
            }
          }
          if (counter == 0) {
            participantsArray.push(participant);
          }
        }
        break;

      case "answer":
        for (let key in participantsArray) {
          if (participantsArray[key].username == data.username) {
            participantsArray[key].answer = data.answer;
            participantsArray[key].lock = "true";
          }
        }
        break;

      case "change":
        for (let key in participantsArray) {
          if (data.username == participantsArray[key].username) {
            if (data.points != null) {
              participantsArray[key].points += data.points;
            }
            if (data.lock != null && participantsArray[key].lock != "false") {
              participantsArray[key].lock = data.lock;
              participantsArray[key].answer = "";
            }
          }
        }
        break;

      case "continue":
        for (let key in participantsArray) {
          if (participantsArray[key].roomnumber == data.roomnumber) {
            participantsArray[key].lock = "false";
            participantsArray[key].answer = "";
          }
        }
        break;

      case "finish":
        if (participantsArray.length > 0) {
          let leader: Participant = participantsArray[0];
          let loser: Participant = participantsArray[0];

          for (let key in participantsArray) {
            userbase.updateOne({ username: participantsArray[key].username }, { $set: { lastWin: false, lastLoss: false } });
            if (participantsArray[key].roomnumber == data.roomnumber) {
              if (participantsArray[key].points > leader.points) {
                leader = participantsArray[key];
              }
              if (participantsArray[key].points < loser.points) {
                loser = participantsArray[key];
              }
            }
          }

          userbase.updateOne({ username: leader.username }, { $set: { lastWin: true }, $inc: { wins: +1 } });
          userbase.updateOne({ username: loser.username }, { $set: { lastLoss: true }, $inc: { losses: +1 } });
          io.to(data.roomnumber).emit("finish");
        }
        break;
    }

    let localParticipantsArray: Participant[] = [];
    for (let key in participantsArray) {
      if (data.roomnumber == participantsArray[key].roomnumber) {
        localParticipantsArray.push(participantsArray[key]);
      }
    }

    io.to(data.roomnumber).emit("update", JSON.stringify(localParticipantsArray));
  });
});
