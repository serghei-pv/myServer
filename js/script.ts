namespace nerdquiz {
  let currentPage: string = window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1);
  let createQuizForm: HTMLFormElement = <HTMLFormElement>document.getElementById("createQuizForm");
  let quizTop: HTMLDivElement = <HTMLDivElement>document.getElementById("quizTop");
  let quizBottom: HTMLDivElement = <HTMLDivElement>document.getElementById("quizBottom");
  let questionDisplay: HTMLParagraphElement = <HTMLParagraphElement>document.getElementById("questionDisplay");
  let answerDisplay: HTMLParagraphElement = <HTMLParagraphElement>document.getElementById("answerDisplay");
  let questionNumberDisplay: HTMLDivElement = <HTMLDivElement>document.getElementById("questionNumberDisplay");
  let modal: HTMLElement = <HTMLElement>document.getElementById("modal");
  let modaltext: HTMLParagraphElement = <HTMLParagraphElement>document.getElementById("modaltext");

  let createQuestionsCounter: number = 1;
  let questionCounter: number = 0;
  let filledTextAreaArray: HTMLTextAreaElement[] = [];

  let ws = new WebSocket("wss://wb-s.herokuapp.com/");
  let host: string = "https://wb-s.herokuapp.com/";
  // let ws = new WebSocket("ws://localhost:8100/");
  // let host: string = "http://localhost:8100/";

  let loginVariable: string = "login";
  let createQuizVariable: string = "create";
  let saveQuizVariable: string = "save";
  let loadQuizVariable: string = "load";

  window.addEventListener("load", waitForWebsocket);

  function waitForWebsocket() {
    setTimeout(function () {
      if (ws.readyState === 1) {
        pageCheck();
      } else {
        waitForWebsocket();
      }
    }, 5);
  }

  function pageCheck(): void {
    let loginButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("loginButton");

    switch (currentPage) {
      case "":
        loginButton.addEventListener("click", processLogin);
        break;

      case "index.html":
        loginButton.addEventListener("click", processLogin);
        break;

      case "rooms.html":
        ws.send(
          JSON.stringify({
            type: "quizList",
          })
        );

        ws.addEventListener("message", ({ data }) => {
          data = JSON.parse(data);
          for (let i: number = 0; i < data.length; i++) {
            if (data[i].question != undefined) {
              let quizList: HTMLUListElement = <HTMLUListElement>document.getElementById("quizList");
              let quizRow: HTMLTableRowElement = <HTMLTableRowElement>document.createElement("TR");
              let quizNumber: HTMLTableCellElement = <HTMLTableCellElement>document.createElement("TD");
              let quizID: HTMLTableCellElement = <HTMLTableCellElement>document.createElement("TD");
              let quizQuestionAmount: HTMLTableCellElement = <HTMLTableCellElement>document.createElement("TD");
              let quizSubmitter: HTMLTableCellElement = <HTMLTableCellElement>document.createElement("TD");

              quizRow.addEventListener("click", loadQuiz);
              quizRow.className = "quizRow";
              quizNumber.className = "quizNumber";
              quizID.className = "quizID";
              quizQuestionAmount.className = "quizQuestionAmount";
              quizSubmitter.className = "quizSubmitter";

              quizNumber.innerHTML = JSON.stringify(i + 1);
              quizID.innerHTML = data[i]._id;
              quizQuestionAmount.innerHTML = data[i].question.length;
              quizSubmitter.innerHTML = data[i].username;

              quizList.insertBefore(quizRow, quizList.childNodes[2]);
              quizRow.appendChild(quizNumber);
              quizRow.appendChild(quizID);
              quizRow.appendChild(quizQuestionAmount);
              quizRow.appendChild(quizSubmitter);

              function loadQuiz(): void {
                if (sessionStorage.getItem("username") == data[i].username) {
                  sessionStorage.setItem("quiz", JSON.stringify(data[i]));
                  window.location.href = "./host.html";
                } else {
                  sessionStorage.setItem("quizLength", data[i].question.length);
                  window.location.href = "./participant.html";

                  if (sessionStorage.getItem("quiz") != null) {
                    sessionStorage.removeItem("quiz");
                  }
                }
                sessionStorage.setItem("roomNumber", data[i]._id);
              }
            }
          }
        });
        break;

      case "create.html":
        processLoadQuiz();
        let addQuestionButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("addQuestionButton");
        let removeQuestionButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("removeQuestionButton");
        let createQuiz: HTMLButtonElement = <HTMLButtonElement>document.getElementById("createQuiz");
        let saveQuiz: HTMLButtonElement = <HTMLButtonElement>document.getElementById("saveQuiz");

        addQuestionButton.addEventListener("click", addQuestion);
        removeQuestionButton.addEventListener("click", removeQuestion);
        createQuiz.addEventListener("click", processCreateQuiz);
        saveQuiz.addEventListener("click", processSaveQuiz);
        break;

      case "host.html":
        hostQuiz();
        manageQuiz();
        ws.send(JSON.stringify({}));
        break;

      case "participant.html":
        participateQuiz();
        ws.send(
          JSON.stringify({
            type: "participant",
            username: sessionStorage.getItem("username"),
            roomnumber: sessionStorage.getItem("roomNumber"),
          })
        );
        break;
    }
  }

  let nextQuestionButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("nextQuestion");
  let previousQuestionButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("previousQuestion");

  function hostQuiz(): void {
    let nextQuestion: HTMLButtonElement = <HTMLButtonElement>document.getElementById("nextQuestion");
    let quizFooter: HTMLElement = <HTMLElement>document.getElementById("quizFooter");

    nextQuestion.addEventListener("click", processContinue);
    quizFooter.appendChild(questionNumberDisplay);
    quizTop.appendChild(questionDisplay);
    quizTop.appendChild(answerDisplay);
    displayQuestion();
  }

  function manageQuiz(): void {
    previousQuestionButton.addEventListener("click", previousQuestion);
    nextQuestionButton.addEventListener("click", nextQuestion);

    ws.addEventListener("message", ({ data }) => {
      data = JSON.parse(data);
      for (let i: number = 0; i < data.length; i++) {
        if (sessionStorage.getItem("roomNumber") == data[i].roomnumber) {
          let leftMain: HTMLUListElement = <HTMLUListElement>document.getElementById("leftMain");
          let participantContainer: HTMLLIElement = <HTMLLIElement>document.createElement("LI");
          let participantName: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
          let participantPoints: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
          let answerContainer: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
          let participantAnswerName: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
          let participantAnswer: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
          let participantSubPoint: HTMLButtonElement = <HTMLButtonElement>document.createElement("BUTTON");
          let participantAddPoint: HTMLButtonElement = <HTMLButtonElement>document.createElement("BUTTON");
          let participantSubHalfPoint: HTMLButtonElement = <HTMLButtonElement>document.createElement("BUTTON");
          let participantAddHalfPoint: HTMLButtonElement = <HTMLButtonElement>document.createElement("BUTTON");
          let participantUnlock: HTMLButtonElement = <HTMLButtonElement>document.createElement("BUTTON");

          let subPoint: any = { type: "change", username: data[i].username, points: -1 };
          let subHalfPoint: any = { type: "change", username: data[i].username, points: -0.5 };
          let addHalfPoint: any = { type: "change", username: data[i].username, points: +0.5 };
          let addPoint: any = { type: "change", username: data[i].username, points: +1 };
          let unlockAnswer = { type: "change", username: data[i].username, lock: "false" };

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
            answerContainer.className = "answerContainer";
            participantAnswerName.className = "participantAnswerName";
            participantSubPoint.className = "participantSubPoint";
            participantSubHalfPoint.className = "participantSubHalfPoint";
            participantAddHalfPoint.className = "participantAddHalfPoint";
            participantAddPoint.className = "participantAddPoint";
            participantAnswer.className = "participantAnswer";
            participantUnlock.className = "participantUnlock";

            leftMain.appendChild(participantContainer);
            participantContainer.appendChild(participantName);
            participantContainer.appendChild(participantPoints);
            answerContainer.appendChild(participantAnswerName);
            answerContainer.appendChild(participantSubPoint);
            answerContainer.appendChild(participantSubHalfPoint);
            answerContainer.appendChild(participantAddHalfPoint);
            answerContainer.appendChild(participantAddPoint);
            answerContainer.appendChild(participantUnlock);
            answerContainer.appendChild(participantAnswer);

            participantSubPoint.innerHTML = "-1";
            participantSubHalfPoint.innerHTML = "-0.5";
            participantAddHalfPoint.innerHTML = "+0.5";
            participantAddPoint.innerHTML = "+1";
            participantUnlock.innerHTML = "clear";

            participantContainer.addEventListener("click", showParticipantAnswer);
            participantSubPoint.addEventListener("click", subPoints);
            participantSubHalfPoint.addEventListener("click", subHalfPoints);
            participantAddHalfPoint.addEventListener("click", addHalfPoints);
            participantAddPoint.addEventListener("click", addPoints);
            participantUnlock.addEventListener("click", unlock);

            function showParticipantAnswer(): void {
              if (quizBottom.childNodes.length != 0) {
                let lastChildQuizBottom: ChildNode = <ChildNode>quizBottom.lastChild;
                quizBottom.removeChild(lastChildQuizBottom);
              }
              quizBottom.appendChild(answerContainer);
              participantAnswerName.innerHTML = data[i].username;
              participantAnswer.innerHTML = data[i].answer;
              ws.send(JSON.stringify({}));
            }
          }

          function subPoints(): void {
            ws.send(JSON.stringify(subPoint));
          }
          function addPoints(): void {
            ws.send(JSON.stringify(addPoint));
          }
          function subHalfPoints(): void {
            ws.send(JSON.stringify(subHalfPoint));
          }
          function addHalfPoints(): void {
            ws.send(JSON.stringify(addHalfPoint));
          }
          function unlock(): void {
            ws.send(JSON.stringify(unlockAnswer));
          }

          let iName: HTMLDivElement = <HTMLDivElement>document.getElementById("name" + i);
          let iPoints: HTMLDivElement = <HTMLDivElement>document.getElementById("points" + i);

          if (iName.innerHTML != data[i].username || iPoints.innerHTML != data[i].points) {
            iName.innerHTML = data[i].username;
            iPoints.innerHTML = data[i].points;
          }

          if (data[i].answer != "") {
            iName.classList.add("blue");
          } else {
            iName.classList.remove("blue");
          }

          let iAnswerName: HTMLDivElement = <HTMLDivElement>document.getElementById("answerName" + i);
          let iAnswer: HTMLDivElement = <HTMLDivElement>document.getElementById("answer" + i);

          if (quizBottom.childNodes.length != 0) {
            if (iAnswerName != null && iAnswer != null) {
              if (iAnswerName.innerHTML != data[i].username || iAnswer.innerHTML != data[i].answer) {
                iAnswerName.innerHTML = data[i].username;
                iAnswer.innerHTML = data[i].answer;
              }
            }
          }
        } else {
          i--;
          data.splice(i, 1);
        }
      }
    });
  }

  function participateQuiz(): void {
    let answerForm: HTMLFormElement = <HTMLFormElement>document.createElement("FORM");
    let textArea: HTMLTextAreaElement = <HTMLTextAreaElement>document.createElement("TEXTAREA");
    let submitButton: HTMLButtonElement = <HTMLButtonElement>document.createElement("BUTTON");
    let pointsDisplay: HTMLParagraphElement = <HTMLParagraphElement>document.createElement("P");
    let points: number;

    quizTop.appendChild(answerForm);
    answerForm.appendChild(textArea);
    answerForm.appendChild(submitButton);
    quizBottom.appendChild(pointsDisplay);
    answerForm.className = "answerForm";
    textArea.className = "participantsTextarea";
    submitButton.className = "submitButton";
    submitButton.id = "answerButton";
    textArea.name = "answer";
    submitButton.innerHTML = "Answer";
    submitButton.type = "button";
    pointsDisplay.id = "answerPoints";

    textArea.addEventListener("input", autoExpand);
    submitButton.addEventListener("click", processAnswer);

    function autoExpand(): void {
      let heightLimit: number = 60;
      textArea.style.height = "";
      textArea.style.height = Math.min(textArea.scrollHeight, heightLimit) + "px";
    }

    ws.addEventListener("message", ({ data }) => {
      let answerButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("answerButton");
      let answerField: HTMLTextAreaElement = <HTMLTextAreaElement>document.querySelector("TEXTAREA");
      for (let i: number = 0; i < JSON.parse(data).length; i++) {
        if (JSON.parse(data)[i].username == sessionStorage.getItem("username")) {
          if (points != JSON.parse(data)[i].points) {
            points = JSON.parse(data)[i].points;
            pointsDisplay.innerHTML = points + " / " + sessionStorage.getItem("quizLength");
          }

          if (JSON.parse(data)[i].lock == "true") {
            answerButton.classList.add("lock");
            answerField.classList.add("lock");
            answerField.value = JSON.parse(data)[i].answer;
          }
          if (JSON.parse(data)[i].lock == "false") {
            answerButton.classList.remove("lock");
            answerField.classList.remove("lock");
            answerField.value = "";
          }
        }
      }
    });
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
    questionArea.id = "questionArea" + createQuestionsCounter;
    answerArea.id = "answerArea" + createQuestionsCounter;
    questionArea.setAttribute("name", "question");
    answerArea.setAttribute("name", "answer");
    questionArea.placeholder = "Question:";
    answerArea.placeholder = "Answer:";

    filledTextAreaArray.push(questionArea);
    filledTextAreaArray.push(answerArea);

    createQuizForm.appendChild(createSlot);
    createSlot.appendChild(numberArea);
    createSlot.appendChild(questionArea);
    createSlot.appendChild(answerArea);

    window.scrollTo(0, document.body.scrollHeight);
    questionArea.focus();
    createQuestionsCounter++;
  }

  function removeQuestion(): void {
    let lastChildcreateQuizForm: ChildNode = <ChildNode>createQuizForm.lastChild;

    if (createQuestionsCounter > 2) {
      for (let i: number = 0; i < 1; i++) {
        createQuizForm.removeChild(lastChildcreateQuizForm);
        filledTextAreaArray.length -= 2;
      }
      createQuestionsCounter--;
    }
  }

  let storageQuiz: string = <string>sessionStorage.getItem("quiz");

  function displayQuestion(): void {
    questionNumberDisplay.innerHTML = JSON.stringify(questionCounter + 1);
    questionDisplay.innerHTML = JSON.parse(storageQuiz).question[questionCounter];
    answerDisplay.innerHTML = "Answer: " + JSON.parse(storageQuiz).answer[questionCounter];
  }

  function previousQuestion(): void {
    questionCounter--;

    if (questionCounter == 0) {
      previousQuestionButton.style.visibility = "hidden";
    }

    nextQuestionButton.style.visibility = "visible";

    displayQuestion();
  }
  function nextQuestion(): void {
    questionCounter++;

    if (JSON.parse(storageQuiz).question[questionCounter + 1] == undefined) {
      nextQuestionButton.style.visibility = "hidden";
    }

    previousQuestionButton.style.visibility = "visible";

    displayQuestion();
  }

  function processLogin(): void {
    processRequest(host, loginVariable);
  }
  function processCreateQuiz(): void {
    let filledTextArea: number = 0;

    for (let i: number = 0; i < filledTextAreaArray.length; i++) {
      if (filledTextAreaArray[i].value != "") {
        filledTextArea++;
      }
    }

    if (filledTextAreaArray.length == filledTextArea) {
      processRequest(host, createQuizVariable);
      modal.style.display = "block";
      modaltext.style.color = "#00FF50";
      modaltext.innerHTML = "Quiz created!";
      setTimeout(function () {
        console.log("huh");
        window.location.href = "./rooms.html";
      }, 1000);

      filledTextAreaArray.length = 0;
    } else {
      modal.style.display = "block";
      modaltext.innerHTML = "Fill out everything!";

      setTimeout(function () {
        modal.style.display = "none";
      }, 3000);
    }
  }
  function processSaveQuiz(): void {
    modal.style.display = "block";
    modaltext.style.color = "#00FF50";
    modaltext.innerHTML = "Saved successfully!";

    setTimeout(function () {
      modaltext.style.color = "#FF1D19";
      modal.style.display = "none";
    }, 3000);
    try {
      processRequest(host, saveQuizVariable);
    } catch (e) {
      modal.style.display = "block";
      modaltext.innerHTML = "An error accured";

      setTimeout(function () {
        modal.style.display = "none";
      }, 3000);
    }
  }
  function processLoadQuiz(): void {
    processRequest(host, loadQuizVariable);
  }
  function processAnswer(): void {
    let answer: HTMLTextAreaElement = <HTMLTextAreaElement>document.querySelector("textarea");
    let formData: FormData = new FormData(document.forms[0]);
    let query: URLSearchParams = new URLSearchParams(<any>formData);
    if (answer.value != "") {
      ws.send(
        JSON.stringify({
          type: "answer",
          username: sessionStorage.getItem("username"),
          answer: query.get("answer"),
        })
      );
    } else {
      console.log("test");
    }
  }
  function processContinue(): void {
    ws.send(
      JSON.stringify({
        type: "continue",
      })
    );
    quizBottom.innerHTML = "";
  }

  async function processRequest(_url: RequestInfo, _pathname: string): Promise<void> {
    let formData: FormData = new FormData(document.forms[0]);
    let query: URLSearchParams = new URLSearchParams(<any>formData);
    let response: Response;
    let queryUsername: string = <string>query.get("username");
    let textData: string;
    let data;

    switch (_pathname) {
      case loginVariable:
        _url += loginVariable;

        data = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: query.get("username"),
            // password: query.get("password"),
          }),
        };

        response = await fetch(_url, data);
        textData = await response.text();

        if (textData == query.get("username")) {
          sessionStorage.setItem("login", "true");
          sessionStorage.setItem("username", queryUsername);
          window.location.href = "./pages/home.html";
        }
        break;

      case saveQuizVariable:
        let saveMessage: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
        saveMessage.className = "alertMessage";

        _url += saveQuizVariable;

        data = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: sessionStorage.getItem("username"),
            ready: "false",
            question: query.getAll("question"),
            answer: query.getAll("answer"),
          }),
        };
        break;

      case createQuizVariable:
        _url += createQuizVariable;

        data = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: sessionStorage.getItem("username"),
            ready: "true",
            question: query.getAll("question"),
            answer: query.getAll("answer"),
          }),
        };
        await fetch(_url, data);
        break;

      case loadQuizVariable:
        _url += loadQuizVariable;

        data = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: sessionStorage.getItem("username"),
          }),
        };

        response = await fetch(_url, data);
        let quiz = await response.json();

        if (quiz != "0") {
          for (let i: number = 1; i <= quiz[1].length; i++) {
            addQuestion();

            let localQuestionArea: HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById("questionArea" + i);
            let localAnswerArea: HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById("answerArea" + i);

            localQuestionArea.value = quiz[0][i - 1];
            localAnswerArea.value = quiz[1][i - 1];
          }
        } else {
          addQuestion();
        }
        break;
    }
  }
}
