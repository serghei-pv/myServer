"use strict";
let currentPage = window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1);
let addQuestionButton = document.getElementById("addQuestionButton");
let createQuestionsCounter = 2;
if (currentPage == "create.html") {
    addQuestionButton.addEventListener("click", addQuestion);
    function addQuestion() {
        let createQuizForm = document.getElementById("createQuizForm");
        let headingCreateQuestion = document.createElement("H1");
        let questionArea = document.createElement("TEXTAREA");
        let answerArea = document.createElement("TEXTAREA");
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
//# sourceMappingURL=script.js.map