export namespace nerdquiz {
  let currentPage: string = window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1);

  let createQuizForm: HTMLFormElement = <HTMLFormElement>document.getElementById("createQuizForm");
  let addQuestionButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("addQuestionButton");
  let removeQuestionButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("removeQuestionButton");
  let createQuiz: HTMLButtonElement = <HTMLButtonElement>document.getElementById("createQuiz");

  let createQuestionsCounter: number = 2;

  let host: string = "http://localhost:8100/";
  let createQuizVariable: string = "create";

  if (currentPage == "create.html") {
    addQuestionButton.addEventListener("click", addQuestion);
    removeQuestionButton.addEventListener("click", removeQuestion);
    createQuiz.addEventListener("click", sendCreateQuizToServer);
  }

  function addQuestion(): void {
    let headingCreateQuestion: HTMLHeadingElement = <HTMLHeadingElement>document.createElement("H1");
    let questionArea: HTMLTextAreaElement = <HTMLTextAreaElement>document.createElement("TEXTAREA");
    let answerArea: HTMLTextAreaElement = <HTMLTextAreaElement>document.createElement("TEXTAREA");

    headingCreateQuestion.innerHTML = "Question " + createQuestionsCounter;
    questionArea.className = "questionArea";
    answerArea.className = "answerArea";
    questionArea.name = "questionField" + createQuestionsCounter;
    answerArea.name = "answerField" + createQuestionsCounter;
    questionArea.placeholder = "Question:";
    answerArea.placeholder = "Answer:";

    createQuizForm.appendChild(headingCreateQuestion);
    createQuizForm.appendChild(questionArea);
    createQuizForm.appendChild(answerArea);

    window.scrollTo(0, document.body.scrollHeight);
    createQuestionsCounter++;
  }

  function removeQuestion(): void {
    if (createQuizForm.childNodes.length > 7) {
      for (let i: number = 0; i < 3; i++) {
        createQuizForm.removeChild(createQuizForm.lastChild);
      }
      createQuestionsCounter--;
    }
  }

  function sendCreateQuizToServer(): void {
    processRequest(host, createQuizVariable);
  }

  async function processRequest(_url: RequestInfo, _pathname: string): Promise<void> {
    let formData: FormData = new FormData(document.forms[0]);
    let query: URLSearchParams = new URLSearchParams(<any>formData);
    let response: Response;
    let textData: string;

    if (_pathname == createQuizVariable) {
      _url += createQuizVariable + "?" + query.toString();
      response = await fetch(_url);
      textData = await response.text();
    }
  }
}
