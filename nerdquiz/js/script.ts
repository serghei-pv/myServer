namespace nerdquiz {
  let ws = new WebSocket("ws://localhost:8100/");
  let currentPage: string = window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1);

  let indexMain: HTMLElement = <HTMLElement>document.getElementById("indexMain");
  let indexMenuRight: HTMLUListElement = <HTMLUListElement>document.getElementById("indexMenuRight");
  let registerButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("registerButton");
  let loginButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("loginButton");
  let createQuizForm: HTMLFormElement = <HTMLFormElement>document.getElementById("createQuizForm");
  let addQuestionButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("addQuestionButton");
  let removeQuestionButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("removeQuestionButton");
  let createQuiz: HTMLButtonElement = <HTMLButtonElement>document.getElementById("createQuiz");
  let quizList: HTMLUListElement = <HTMLUListElement>document.getElementById("quizList");
  let QAArea: HTMLDivElement = <HTMLDivElement>document.getElementById("QAArea");
  let quizFooter: HTMLElement = <HTMLElement>document.getElementById("quizFooter");

  let questionDisplay: HTMLParagraphElement = <HTMLParagraphElement>document.getElementById("questionDisplay");
  let answerDisplay: HTMLParagraphElement = <HTMLParagraphElement>document.getElementById("answerDisplay");
  let questionNumberDisplay: HTMLDivElement = <HTMLDivElement>document.getElementById("questionNumberDisplay");
  let participantsArea: HTMLDivElement = <HTMLDivElement>document.getElementById("participantsArea");

  let createQuestionsCounter: number = 2;
  let questionCounter: number = 0;
  let quiz = JSON.parse(localStorage.getItem("quiz"));

  let host: string = "http://localhost:8100/";
  let connectionVariable: string = "connected";
  let loginVariable: string = "login";
  let registerVariable: string = "register";
  let createQuizVariable: string = "create";
  let quizListVariable: string = "quizList";
  let participantVariable: string = "participant";
  let answerVariable: string = "answer";

  if (sessionStorage.getItem("login") != "true") {
    for (let i: number = indexMenuRight.childNodes.length; i > 0; i--) {
      indexMenuRight.removeChild(indexMenuRight.lastChild);
    }
  }

  if (currentPage == "index.html") {
    registerButton.addEventListener("click", processRegistration);
    loginButton.addEventListener("click", processLogin);
    if (sessionStorage.getItem("login") == "true") {
      window.addEventListener("load", preocessConnection);
      for (let i: number = indexMain.childNodes.length; i > 0; i--) {
        indexMain.removeChild(indexMain.lastChild);
      }
    }
  }

  if (currentPage == "rooms.html") {
    window.addEventListener("load", processQuizList);
  }

  if (currentPage == "create.html") {
    addQuestionButton.addEventListener("click", addQuestion);
    removeQuestionButton.addEventListener("click", removeQuestion);
    createQuiz.addEventListener("click", processQuizCreation);
  }

  if (currentPage == "quiz.html") {
    let quiz = JSON.parse(localStorage.getItem("quiz"));
    if (sessionStorage.getItem("user") == quiz.user) {
      hostQuiz();

      document.getElementById("previousQuestion").addEventListener("click", previousQuestion);
      document.getElementById("nextQuestion").addEventListener("click", nextQuestion);

      ws.addEventListener("message", ({ data }) => {
        for (let i: number = 0; i < JSON.parse(data).length; i++) {
          let particpantTable: HTMLParagraphElement = <HTMLParagraphElement>document.createElement("P");
          let particpantTable2: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
          let participantName: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
          let participantPoints: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
          let participantSubPoint: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
          let participantAddPoint: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
          let participantAnswer: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");

          let subParticipant: any = { username: JSON.parse(data)[i].username, points: JSON.parse(data)[i].points - 1 };
          let addParticipant: any = { username: JSON.parse(data)[i].username, points: JSON.parse(data)[i].points + 1 };

          if (JSON.parse(data).length > participantsArea.childNodes.length && i == participantsArea.childNodes.length) {
            participantName.id = "name" + i;
            participantPoints.id = "points" + i;
            participantAnswer.id = "answer" + i;
            participantSubPoint.id = "subPoint" + i;
            participantAddPoint.id = "addPoint" + i;

            particpantTable.className = "particpantTable";
            particpantTable2.className = "particpantTable2";

            participantPoints.className = "participantPoints";
            participantName.className = "participantName";
            participantSubPoint.className = "participantSubPoint";
            participantAddPoint.className = "participantAddPoint";
            participantAnswer.className = "participantAnswer";

            participantsArea.appendChild(particpantTable);
            particpantTable.appendChild(particpantTable2);

            particpantTable2.appendChild(participantName);
            particpantTable2.appendChild(participantSubPoint);
            particpantTable2.appendChild(participantAddPoint);
            particpantTable2.appendChild(participantPoints);
            particpantTable.appendChild(participantAnswer);
          }
          document.getElementById("subPoint" + i).addEventListener("click", subPoints);
          document.getElementById("addPoint" + i).addEventListener("click", addPoints);
          function subPoints(): void {
            if (JSON.parse(data)[i].points > 0) {
              ws.send(JSON.stringify(subParticipant));
            }
          }
          function addPoints(): void {
            ws.send(JSON.stringify(addParticipant));
          }

          participantSubPoint.innerHTML = "-";
          participantAddPoint.innerHTML = "+";
          document.getElementById("name" + i).innerHTML = JSON.parse(data)[i].username;
          document.getElementById("points" + i).innerHTML = JSON.parse(data)[i].points;
          document.getElementById("answer" + i).innerHTML = JSON.parse(data)[i].answer;
        }
      });
    }
    if (sessionStorage.getItem("user") != quiz.user) {
      participateQuiz();
      processParticipant();
    }
  }

  function addQuestion(): void {
    let headingCreateQuestion: HTMLHeadingElement = <HTMLHeadingElement>document.createElement("H1");
    let questionArea: HTMLTextAreaElement = <HTMLTextAreaElement>document.createElement("TEXTAREA");
    let answerArea: HTMLTextAreaElement = <HTMLTextAreaElement>document.createElement("TEXTAREA");

    headingCreateQuestion.innerHTML = "Question " + createQuestionsCounter;
    questionArea.className = "questionArea";
    answerArea.className = "answerArea";
    questionArea.setAttribute("name", "question");
    answerArea.setAttribute("name", "answer");
    questionArea.placeholder = "Question:";
    answerArea.placeholder = "Answer:";

    createQuizForm.appendChild(headingCreateQuestion);
    createQuizForm.appendChild(questionArea);
    createQuizForm.appendChild(answerArea);

    window.scrollTo(0, document.body.scrollHeight);
    createQuestionsCounter++;
  }

  function removeQuestion(): void {
    if (createQuestionsCounter > 2) {
      for (let i: number = 0; i < 3; i++) {
        createQuizForm.removeChild(createQuizForm.lastChild);
      }
      createQuestionsCounter--;
    }
  }

  function displayQuestion(): void {
    questionNumberDisplay.innerHTML = JSON.stringify(questionCounter + 1);
    questionDisplay.innerHTML = quiz.question[questionCounter];
    answerDisplay.innerHTML = "Answer: " + quiz.answer[questionCounter];
  }

  function hostQuiz(): void {
    document.getElementById("nextQuestion").style.visibility = "visible";

    quizFooter.appendChild(questionNumberDisplay);
    QAArea.appendChild(questionDisplay);
    QAArea.appendChild(answerDisplay);

    displayQuestion();
  }

  function participateQuiz(): void {
    let answerForm: HTMLFormElement = <HTMLFormElement>document.createElement("FORM");
    let textArea: HTMLTextAreaElement = <HTMLTextAreaElement>document.createElement("TEXTAREA");
    let submitButton: HTMLButtonElement = <HTMLButtonElement>document.createElement("BUTTON");
    QAArea.appendChild(answerForm);
    answerForm.appendChild(textArea);
    answerForm.appendChild(submitButton);
    textArea.className = "participantsTextarea";
    textArea.name = "answer";
    submitButton.className = "submitButton";
    submitButton.innerHTML = "Answer";
    submitButton.type = "button";

    submitButton.addEventListener("click", processAnswer);
  }

  function previousQuestion(): void {
    questionCounter--;

    if (questionCounter == 0) {
      document.getElementById("previousQuestion").style.visibility = "hidden";
    }

    document.getElementById("nextQuestion").style.visibility = "visible";

    displayQuestion();
  }
  function nextQuestion(): void {
    questionCounter++;

    if (quiz.question[questionCounter + 1] == undefined) {
      document.getElementById("nextQuestion").style.visibility = "hidden";
    }

    document.getElementById("previousQuestion").style.visibility = "visible";

    displayQuestion();
  }

  function preocessConnection(): void {
    processRequest("ws://localhost:8100/", connectionVariable);
  }
  function processRegistration(): void {
    processRequest(host, registerVariable);
  }
  function processLogin(): void {
    processRequest(host, loginVariable);
  }
  function processQuizCreation(): void {
    processRequest(host, createQuizVariable);
  }
  function processQuizList(): void {
    processRequest(host, quizListVariable);
  }
  function processParticipant(): void {
    processRequest(host, participantVariable);
  }
  function processAnswer(): void {
    processRequest(host, answerVariable);
  }

  async function processRequest(_url: RequestInfo, _pathname: string): Promise<void> {
    let formData: FormData = new FormData(document.forms[0]);
    let query: URLSearchParams = new URLSearchParams(<any>formData);
    let response: Response;
    let textData: string;
    let username: string = query.get("username");

    if (_pathname == registerVariable) {
      _url += registerVariable + "?" + query.toString();
      response = await fetch(_url);
      textData = await response.text();

      if (textData == username) {
        sessionStorage.setItem("login", "true");
        sessionStorage.setItem("user", username);
        window.location.href = "./index.html";
      }
    }

    if (_pathname == loginVariable) {
      _url += loginVariable + "?" + query.toString();
      response = await fetch(_url);
      textData = await response.text();

      if (textData == username) {
        sessionStorage.setItem("login", "true");
        sessionStorage.setItem("user", username);
        window.location.href = "./index.html";
      }
    }

    if (_pathname == createQuizVariable) {
      _url += createQuizVariable + "?" + query.toString() + "&user=" + sessionStorage.getItem("user");
      response = await fetch(_url);
      textData = await response.text();
      console.log(textData);
      window.location.href = "../pages/create.html";
    }

    if (_pathname == quizListVariable) {
      _url += quizListVariable + "?";
      response = await fetch(_url);
      let quizDataArray = await response.json();

      for (let i: number = 0; i < quizDataArray.length; i++) {
        let quizSlot: HTMLLIElement = <HTMLLIElement>document.createElement("LI");
        quizSlot.addEventListener("click", loadQuiz);
        quizList.appendChild(quizSlot);
        quizSlot.className = "quizSlot";
        quizSlot.innerHTML = quizDataArray[i]._id + " - <i>by " + quizDataArray[i].user + "</i>";

        function loadQuiz(): void {
          window.location.href = "../pages/quiz.html";
        }
      }
    }

    if (_pathname == participantVariable) {
      _url += participantVariable + "?" + query.toString() + "&username=" + sessionStorage.getItem("user");
      response = await fetch(_url);
    }

    if (_pathname == answerVariable) {
      _url += answerVariable + "?" + query.toString() + "&username=" + sessionStorage.getItem("user");
      response = await fetch(_url);
    }
  }

  // if (currentPage == "quiz.html") {
  //   ws.addEventListener("connection", connection);
  // }

  // ws.addEventListener("message", ({ data }) => {
  //   console.log(data);
  // });

  // function connection(): void {
  //   let username: string = '{"username": sessionStorage.getItem("user")}';
  //   ws.send(username);
  // }

  // let username: string = "";
  // let points: number = 0;
  // let answer: string = "";

  // ws.addEventListener("message", ({ data }) => {
  //   let i: number;

  //   if (currentPage == "quiz.html") {
  //     for (i = 0; i < JSON.parse(data).length; i++) {
  //       let particpantTable: HTMLParagraphElement = <HTMLParagraphElement>document.createElement("P");
  //       let particpantTable2: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
  //       let participantName: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
  //       let participantPoints: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
  //       let participantSubPoint: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
  //       let participantAddPoint: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
  //       let participantAnswer: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");

  //       if (JSON.parse(data).length > participantsArea.childNodes.length) {
  //         username = JSON.parse(data)[i].username;
  //         points = JSON.parse(data)[i].points;
  //         answer = JSON.parse(data)[i].answer;

  //         participantPoints.id = "points" + i;
  //         participantName.id = "name" + i;
  //         participantAnswer.id = "answer" + i;

  //         particpantTable.className = "particpantTable";
  //         particpantTable2.className = "particpantTable2";

  //         participantPoints.className = "participantPoints";
  //         participantName.className = "participantName";
  //         participantSubPoint.className = "participantSubPoint";
  //         participantAddPoint.className = "participantAddPoint";
  //         participantAnswer.className = "participantAnswer";

  //         participantsArea.appendChild(particpantTable);
  //         particpantTable.appendChild(particpantTable2);

  //         particpantTable2.appendChild(participantName);
  //         particpantTable2.appendChild(participantSubPoint);
  //         particpantTable2.appendChild(participantAddPoint);
  //         particpantTable2.appendChild(participantPoints);
  //         particpantTable.appendChild(participantAnswer);
  //       }

  //       if (participantSubPoint.innerHTML != "-") {
  //         participantSubPoint.innerHTML = "-";
  //       }
  //       if (participantAddPoint.innerHTML != "+") {
  //         participantAddPoint.innerHTML = "+";
  //       }
  //       if (username != JSON.parse(data)[i].username) {
  //         document.getElementById("name" + i).innerHTML = JSON.parse(data)[i].username;
  //       }
  //       if (points != JSON.parse(data)[i].points) {
  //         document.getElementById("points" + i).innerHTML = JSON.parse(data)[i].points;
  //       }
  //       if (answer != JSON.parse(data)[i].answer) {
  //         document.getElementById("answer" + i).innerHTML = JSON.parse(data)[i].answer;
  //       }

  //       username = JSON.parse(data)[i].username;
  //       points = JSON.parse(data)[i].points;
  //       answer = JSON.parse(data)[i].answer;

  //       if (i == JSON.parse(data).length - 1) {
  //         i = 0;
  //       }
  //     }
  //   }
  // });
}
