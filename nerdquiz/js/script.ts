let currentPage: string = window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1);

let addQuestionButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("addQuestionButton");

let createQuestionsCounter: number = 2;

if (currentPage == "create.html") {
  addQuestionButton.addEventListener("click", addQuestion);
  function addQuestion(): void {
    let createQuizForm: HTMLFormElement = <HTMLFormElement>document.getElementById("createQuizForm");
    let headingCreateQuestion: HTMLHeadingElement = <HTMLHeadingElement>document.createElement("H1");
    let questionArea: HTMLTextAreaElement = <HTMLTextAreaElement>document.createElement("TEXTAREA");
    let answerArea: HTMLTextAreaElement = <HTMLTextAreaElement>document.createElement("TEXTAREA");

    headingCreateQuestion.innerHTML = "Question " + createQuestionsCounter;
    questionArea.className = "questionArea";
    answerArea.className = "answerArea";
    questionArea.name = "questionField" + createQuestionsCounter;
    answerArea.name = "answerField" + createQuestionsCounter;
    questionArea.placeholder = "Question:";
    answerArea.placeholder = "Question:";

    createQuizForm.appendChild(headingCreateQuestion);
    createQuizForm.appendChild(questionArea);
    createQuizForm.appendChild(answerArea);

    window.scrollTo(0, document.body.scrollHeight);
    createQuestionsCounter++;
  }
}
