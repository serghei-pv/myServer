namespace nerdquiz {
  let currentPage: string = window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1);

  let indexMain: HTMLElement = <HTMLElement>document.getElementById("indexMain");
  let leftMain: HTMLUListElement = <HTMLUListElement>document.getElementById("leftMain");
  let rightMain: HTMLUListElement = <HTMLUListElement>document.getElementById("rightMain");
  let indexMenu: HTMLUListElement = <HTMLUListElement>document.getElementById("indexMenu");
  let registerButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("registerButton");
  let loginButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("loginButton");
  let createQuizForm: HTMLFormElement = <HTMLFormElement>document.getElementById("createQuizForm");
  let addQuestionButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("addQuestionButton");
  let removeQuestionButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("removeQuestionButton");
  let createQuiz: HTMLButtonElement = <HTMLButtonElement>document.getElementById("createQuiz");
  let quizList: HTMLUListElement = <HTMLUListElement>document.getElementById("quizList");
  let quizTop: HTMLDivElement = <HTMLDivElement>document.getElementById("quizTop");
  let quizBottom: HTMLDivElement = <HTMLDivElement>document.getElementById("quizBottom");
  let quizFooter: HTMLElement = <HTMLElement>document.getElementById("quizFooter");

  let questionDisplay: HTMLParagraphElement = <HTMLParagraphElement>document.getElementById("questionDisplay");
  let answerDisplay: HTMLParagraphElement = <HTMLParagraphElement>document.getElementById("answerDisplay");
  let questionNumberDisplay: HTMLDivElement = <HTMLDivElement>document.getElementById("questionNumberDisplay");

  let createQuestionsCounter: number = 2;
  let questionCounter: number = 0;
  let quiz = JSON.parse(localStorage.getItem("quiz"));

  let ws = new WebSocket("wss://wb-s.herokuapp.com/");
  let host: string = "https://wb-s.herokuapp.com/";
  // let ws = new WebSocket("ws://localhost:8100/");
  // let host: string = "http://localhost:8100/";
  let connectionVariable: string = "connected";
  let loginVariable: string = "login";
  let registerVariable: string = "register";
  let createQuizVariable: string = "create";
  let quizListVariable: string = "quizList";
  let participantVariable: string = "participant";
  let answerVariable: string = "answer";

  if (sessionStorage.getItem("login") != "true") {
    indexMenu.style.visibility = "hidden";
  }

  if (currentPage == "index.html" || currentPage == "") {
    registerButton.addEventListener("click", processRegistration);
    loginButton.addEventListener("click", processLogin);
    if (sessionStorage.getItem("login") == "true") {
      window.addEventListener("load", processConnection);
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
    if (sessionStorage.getItem("user") == quiz.user) {
      hostQuiz();
      manageQuiz();
    }

    if (sessionStorage.getItem("user") != quiz.user) {
      participateQuiz();
      processParticipant();
    }
  }

  function hostQuiz(): void {
    document.getElementById("nextQuestion").style.visibility = "visible";

    quizFooter.appendChild(questionNumberDisplay);
    quizTop.appendChild(questionDisplay);
    quizTop.appendChild(answerDisplay);

    displayQuestion();
  }

  function manageQuiz(): void {
    document.getElementById("previousQuestion").addEventListener("click", previousQuestion);
    document.getElementById("nextQuestion").addEventListener("click", nextQuestion);

    ws.addEventListener("message", ({ data }) => {
      for (let i: number = 0; i < JSON.parse(data).length; i++) {
        let participantContainer: HTMLLIElement = <HTMLLIElement>document.createElement("LI");
        let participantName: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
        let participantPoints: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
        let answerContainer: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
        let participantAnswerName: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
        let participantAnswer: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
        let participantSubPoint: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
        let participantAddPoint: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");

        let subParticipant: any = { username: JSON.parse(data)[i].username, points: -1 };
        let addParticipant: any = { username: JSON.parse(data)[i].username, points: +1 };

        if (i == leftMain.childNodes.length) {
          participantContainer.id = "participantContainer" + i;
          participantName.id = "name" + i;
          participantPoints.id = "points" + i;
          answerContainer.id = "answerContainer" + i;
          participantAnswerName.id = "answerName" + i;
          participantAnswer.id = "answer" + i;
          participantSubPoint.id = "subPoint" + i;
          participantAddPoint.id = "addPoint" + i;

          participantContainer.className = "participantContainer";
          participantName.className = "participantName";
          participantPoints.className = "participantPoints";
          participantSubPoint.className = "participantSubPoint";
          participantAddPoint.className = "participantAddPoint";
          answerContainer.className = "answerContainer";
          participantAnswerName.className = "participantAnswerName";
          participantAnswer.className = "participantAnswer";

          leftMain.appendChild(participantContainer);
          participantContainer.appendChild(participantName);
          participantContainer.appendChild(participantPoints);
          answerContainer.appendChild(participantAnswerName);
          answerContainer.appendChild(participantSubPoint);
          answerContainer.appendChild(participantAddPoint);
          answerContainer.appendChild(participantAnswer);

          participantSubPoint.innerHTML = "-";
          participantAddPoint.innerHTML = "+";

          participantContainer.addEventListener("click", showParticipantAnswer);
          participantSubPoint.addEventListener("click", subPoints);
          participantAddPoint.addEventListener("click", addPoints);

          function showParticipantAnswer(): void {
            if (quizBottom.childNodes.length != 0) {
              quizBottom.removeChild(quizBottom.lastChild);
            }
            quizBottom.appendChild(answerContainer);
            participantAnswerName.innerHTML = JSON.parse(data)[i].username;
            participantAnswer.innerHTML = JSON.parse(data)[i].answer;
          }
        }

        function subPoints(): void {
          ws.send(JSON.stringify(subParticipant));
        }
        function addPoints(): void {
          ws.send(JSON.stringify(addParticipant));
        }

        if (
          document.getElementById("name" + i).innerHTML != JSON.parse(data)[i].username ||
          document.getElementById("points" + i).innerHTML != JSON.parse(data)[i].points
        ) {
          document.getElementById("name" + i).innerHTML = JSON.parse(data)[i].username;
          document.getElementById("points" + i).innerHTML = JSON.parse(data)[i].points;
        }

        if (quizBottom.childNodes.length != 0) {
          if (document.getElementById("answerName" + i) != null && document.getElementById("answer" + i) != null) {
            if (
              document.getElementById("answerName" + i).innerHTML != JSON.parse(data)[i].username ||
              document.getElementById("answer" + i).innerHTML != JSON.parse(data)[i].answer
            ) {
              document.getElementById("answerName" + i).innerHTML = JSON.parse(data)[i].username;
              document.getElementById("answer" + i).innerHTML = JSON.parse(data)[i].answer;
            }
          }
        }
      }
    });
  }

  function participateQuiz(): void {
    let answerForm: HTMLFormElement = <HTMLFormElement>document.createElement("FORM");
    let textArea: HTMLTextAreaElement = <HTMLTextAreaElement>document.createElement("TEXTAREA");
    let submitButton: HTMLButtonElement = <HTMLButtonElement>document.createElement("BUTTON");
    quizTop.appendChild(answerForm);
    answerForm.appendChild(textArea);
    answerForm.appendChild(submitButton);
    textArea.className = "participantsTextarea";
    textArea.name = "answer";
    submitButton.className = "submitButton";
    submitButton.innerHTML = "Answer";
    submitButton.type = "button";

    submitButton.addEventListener("click", processAnswer);
  }

  function addQuestion(): void {
    let createSlot: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
    let numberArea: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
    let questionArea: HTMLTextAreaElement = <HTMLTextAreaElement>document.createElement("TEXTAREA");
    let answerArea: HTMLTextAreaElement = <HTMLTextAreaElement>document.createElement("TEXTAREA");

    numberArea.innerHTML = JSON.stringify(createQuestionsCounter);
    numberArea.className = "numberArea";
    createSlot.className = "createSlot";
    questionArea.className = "questionArea";
    answerArea.className = "answerArea";
    questionArea.setAttribute("name", "question");
    answerArea.setAttribute("name", "answer");
    questionArea.placeholder = "Question:";
    answerArea.placeholder = "Answer:";

    createQuizForm.appendChild(createSlot);
    createSlot.appendChild(numberArea);
    createSlot.appendChild(questionArea);
    createSlot.appendChild(answerArea);

    window.scrollTo(0, document.body.scrollHeight);
    createQuestionsCounter++;
  }

  function removeQuestion(): void {
    if (createQuestionsCounter > 2) {
      for (let i: number = 0; i < 1; i++) {
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

  function processConnection(): void {
    processRequest("wss://wb-s.herokuapp.com/", connectionVariable);
    // processRequest("ws://localhost:8100/", connectionVariable);
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
        let quizRow: HTMLTableRowElement = <HTMLTableRowElement>document.createElement("TR");
        let quizNumber: HTMLTableDataCellElement = <HTMLTableDataCellElement>document.createElement("TD");
        let quizID: HTMLTableDataCellElement = <HTMLTableDataCellElement>document.createElement("TD");
        let quizQuestionAmount: HTMLTableDataCellElement = <HTMLTableDataCellElement>document.createElement("TD");
        let quizSubmitter: HTMLTableDataCellElement = <HTMLTableDataCellElement>document.createElement("TD");
        quizRow.addEventListener("click", loadQuiz);
        quizRow.className = "quizRow";
        quizNumber.className = "quizNumber";
        quizID.className = "quizID";
        quizQuestionAmount.className = "quizQuestionAmount";
        quizSubmitter.className = "quizSubmitter";

        quizNumber.innerHTML = JSON.stringify(i + 1);
        quizID.innerHTML = quizDataArray[i]._id;
        quizQuestionAmount.innerHTML = quizDataArray[i].question.length;
        quizSubmitter.innerHTML = quizDataArray[i].user;

        quizList.appendChild(quizRow);
        quizRow.appendChild(quizNumber);
        quizRow.appendChild(quizID);
        quizRow.appendChild(quizQuestionAmount);
        quizRow.appendChild(quizSubmitter);

        function loadQuiz(): void {
          if (sessionStorage.getItem("user") == quizDataArray[i].user) {
            localStorage.setItem("quiz", JSON.stringify(quizDataArray[i]));
          }
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
}
