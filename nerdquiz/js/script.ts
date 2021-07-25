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
  let participantsArea: HTMLTableElement = <HTMLTableElement>document.getElementById("participantsArea");

  let createQuestionsCounter: number = 2;
  let questionCounter: number = 0;

  let host: string = "http://localhost:8100/";
  let connectionVariable: string = "connected";
  let loginVariable: string = "login";
  let registerVariable: string = "register";
  let createQuizVariable: string = "create";
  let quizListVariable: string = "quizList";

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
      startQuiz();
    }
    if (sessionStorage.getItem("user") != quiz.user) {
      participateQuiz();
    }
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

  function startQuiz(): void {
    let quiz = JSON.parse(localStorage.getItem("quiz"));
    document.getElementById("previousQuestion").style.visibility = "visible";
    document.getElementById("nextQuestion").style.visibility = "visible";

    quizFooter.appendChild(questionNumberDisplay);
    QAArea.appendChild(questionDisplay);
    QAArea.appendChild(answerDisplay);

    questionNumberDisplay.innerHTML = JSON.stringify(questionCounter + 1);
    questionDisplay.innerHTML = quiz.question[questionCounter];
    answerDisplay.innerHTML = "Answer: " + quiz.answer[questionCounter];
  }

  function participateQuiz(): void {
    let textArea: HTMLTextAreaElement = <HTMLTextAreaElement>document.createElement("TEXTAREA");
    let submitButton: HTMLButtonElement = <HTMLButtonElement>document.createElement("BUTTON");
    QAArea.appendChild(textArea);
    QAArea.appendChild(submitButton);
    textArea.className = "participantsTextarea";
    submitButton.className = "submitButton";
    submitButton.innerHTML = "Answer";
  }

  async function processRequest(_url: RequestInfo, _pathname: string): Promise<void> {
    let formData: FormData = new FormData(document.forms[0]);
    let query: URLSearchParams = new URLSearchParams(<any>formData);
    let response: Response;
    let textData: string;
    let username: string = query.get("username");

    if (_pathname == connectionVariable) {
      ws.send(sessionStorage.getItem("user"));
    }

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
          localStorage.setItem("quiz", JSON.stringify(quizDataArray[i]));
        }
      }
    }
  }

  let number: number = 0;
  let username: string = "";
  let points: number = 0;
  let answer: string = "";

  ws.addEventListener("message", ({ data }) => {
    //console.log(JSON.parse(data).length);
    let i: number;

    if (currentPage == "quiz.html") {
      for (i = 0; i < JSON.parse(data).length; i++) {
        let particpantTable: HTMLTableRowElement = <HTMLTableRowElement>document.createElement("TR");
        let particpantTable2: HTMLTableRowElement = <HTMLTableRowElement>document.createElement("TR");
        let participantNumber: HTMLTableHeaderCellElement = <HTMLTableHeaderCellElement>document.createElement("TH");
        let participantName: HTMLTableHeaderCellElement = <HTMLTableHeaderCellElement>document.createElement("TH");
        let participantPoints: HTMLTableHeaderCellElement = <HTMLTableHeaderCellElement>document.createElement("TH");
        let participantSubPoint: HTMLTableHeaderCellElement = <HTMLTableHeaderCellElement>document.createElement("TH");
        let participantAddPoint: HTMLTableHeaderCellElement = <HTMLTableHeaderCellElement>document.createElement("TH");
        let participantAnswer: HTMLTableHeaderCellElement = <HTMLTableHeaderCellElement>document.createElement("TH");

        if (JSON.parse(data).length > participantsArea.childNodes.length) {
          participantNumber.id = "number" + i;
          participantPoints.id = "points" + i;
          participantName.id = "name" + i;
          participantAnswer.id = "answer" + i;

          participantsArea.appendChild(particpantTable);
          particpantTable.appendChild(participantNumber);
          particpantTable.appendChild(participantName);
          particpantTable.appendChild(participantPoints);
          particpantTable.appendChild(participantSubPoint);
          particpantTable.appendChild(participantAddPoint);
          participantsArea.appendChild(particpantTable2);
          particpantTable2.appendChild(participantAnswer);
        }

        if (number != JSON.parse(data)[i].number) {
          document.getElementById("number" + i).innerHTML = JSON.parse(data)[i].number;
        }
        if (username != JSON.parse(data)[i].username) {
          document.getElementById("name" + i).innerHTML = JSON.parse(data)[i].username;
        }
        if (points != JSON.parse(data)[i].points) {
          console.log(points);
          document.getElementById("points" + i).innerHTML = JSON.parse(data)[i].points;
        }
        if (participantSubPoint.innerHTML != "-") {
          participantSubPoint.innerHTML = "-";
        }
        if (participantAddPoint.innerHTML != "+") {
          participantAddPoint.innerHTML = "+";
        }
        if (answer != JSON.parse(data)[i].answer) {
          document.getElementById("answer" + i).innerHTML = JSON.parse(data)[i].answer;
        }
        number = JSON.parse(data)[i].number;
        username = JSON.parse(data)[i].username;
        points = JSON.parse(data)[i].points;
        answer = JSON.parse(data)[i].answer;

        //participantNumber.innerHTML = JSON.stringify(number);
        //participantName.innerHTML = username;
        //participantPoints.innerHTML = JSON.stringify(points);
        //participantSubPoint.innerHTML = "-";
        //participantAddPoint.innerHTML = "+";
        //participantAnswer.innerHTML = answer;
        if (i == JSON.parse(data).length - 1) {
          i = 0;
        }
      }
    }
  });
}
