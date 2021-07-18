import { Quiz } from "../js/interface";

export namespace nerdquiz {
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

  let createQuestionsCounter: number = 2;

  let host: string = "http://localhost:8100/";
  let loginVariable: string = "login";
  let registerVariable: string = "register";
  let createQuizVariable: string = "create";
  let quizListVariable: string = "quizList";

  if (sessionStorage.getItem("login") != "true") {
    for (let key in indexMenuRight.childNodes) {
      if (indexMenuRight.childNodes.length == 0) {
        break;
      }
      indexMenuRight.removeChild(indexMenuRight.lastChild);
    }
  }

  if (currentPage == "index.html") {
    registerButton.addEventListener("click", processRegistration);
    loginButton.addEventListener("click", processLogin);
    if (sessionStorage.getItem("login") == "true") {
      for (let key in indexMain.childNodes) {
        if (indexMain.childNodes.length == 0) {
          break;
        }
        indexMain.removeChild(indexMain.lastChild);
      }
    }
  }

  if (currentPage == "quiz.html") {
    window.onload = processQuizList;
  }

  if (currentPage == "create.html") {
    addQuestionButton.addEventListener("click", addQuestion);
    removeQuestionButton.addEventListener("click", removeQuestion);
    createQuiz.addEventListener("click", processQuizCreation);
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

  async function processRequest(_url: RequestInfo, _pathname: string): Promise<void> {
    let formData: FormData = new FormData(document.forms[0]);
    let query: URLSearchParams = new URLSearchParams(<any>formData);
    let response: Response;
    let textData: string;
    let quizDataArray: Quiz[];
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
      quizDataArray = await response.json();
      console.log(quizDataArray);

      for (let i: number = 0; i < quizDataArray.length; i++) {
        let quizSlot: HTMLLIElement = <HTMLLIElement>document.createElement("LI");
        quizList.appendChild(quizSlot);
        quizSlot.className = "quizSlot";
        quizSlot.innerHTML = JSON.stringify(quizDataArray[i]._id);
      }
    }
  }
}
