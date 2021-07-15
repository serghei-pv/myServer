"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nerdquiz = void 0;
var nerdquiz;
(function (nerdquiz) {
    let currentPage = window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1);
    let createQuizForm = document.getElementById("createQuizForm");
    let addQuestionButton = document.getElementById("addQuestionButton");
    let removeQuestionButton = document.getElementById("removeQuestionButton");
    let createQuiz = document.getElementById("createQuiz");
    let createQuestionsCounter = 2;
    let host = "http://localhost:8100/";
    let createQuizVariable = "create";
    if (currentPage == "create.html") {
        addQuestionButton.addEventListener("click", addQuestion);
        removeQuestionButton.addEventListener("click", removeQuestion);
        createQuiz.addEventListener("click", sendCreateQuizToServer);
    }
    function addQuestion() {
        let headingCreateQuestion = document.createElement("H1");
        let questionArea = document.createElement("TEXTAREA");
        let answerArea = document.createElement("TEXTAREA");
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
    function removeQuestion() {
        if (createQuizForm.childNodes.length > 7) {
            for (let i = 0; i < 3; i++) {
                createQuizForm.removeChild(createQuizForm.lastChild);
            }
            createQuestionsCounter--;
        }
    }
    function sendCreateQuizToServer() {
        processRequest(host, createQuizVariable);
    }
    async function processRequest(_url, _pathname) {
        let formData = new FormData(document.forms[0]);
        let query = new URLSearchParams(formData);
        let response;
        let textData;
        if (_pathname == createQuizVariable) {
            _url += createQuizVariable + "?" + query.toString();
            response = await fetch(_url);
            textData = await response.text();
        }
    }
})(nerdquiz = exports.nerdquiz || (exports.nerdquiz = {}));
//# sourceMappingURL=script.js.map