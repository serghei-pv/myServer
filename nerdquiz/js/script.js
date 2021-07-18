"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nerdquiz = void 0;
var nerdquiz;
(function (nerdquiz) {
    let currentPage = window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1);
    let indexMain = document.getElementById("indexMain");
    let indexMenuRight = document.getElementById("indexMenuRight");
    let registerButton = document.getElementById("registerButton");
    let loginButton = document.getElementById("loginButton");
    let createQuizForm = document.getElementById("createQuizForm");
    let addQuestionButton = document.getElementById("addQuestionButton");
    let removeQuestionButton = document.getElementById("removeQuestionButton");
    let createQuiz = document.getElementById("createQuiz");
    let quizList = document.getElementById("quizList");
    let createQuestionsCounter = 2;
    let host = "http://localhost:8100/";
    let loginVariable = "login";
    let registerVariable = "register";
    let createQuizVariable = "create";
    let quizListVariable = "quizList";
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
    function processRegistration() {
        processRequest(host, registerVariable);
    }
    function processLogin() {
        processRequest(host, loginVariable);
    }
    function processQuizCreation() {
        processRequest(host, createQuizVariable);
    }
    function processQuizList() {
        processRequest(host, quizListVariable);
    }
    function addQuestion() {
        let headingCreateQuestion = document.createElement("H1");
        let questionArea = document.createElement("TEXTAREA");
        let answerArea = document.createElement("TEXTAREA");
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
    function removeQuestion() {
        if (createQuestionsCounter > 2) {
            for (let i = 0; i < 3; i++) {
                createQuizForm.removeChild(createQuizForm.lastChild);
            }
            createQuestionsCounter--;
        }
    }
    async function processRequest(_url, _pathname) {
        let formData = new FormData(document.forms[0]);
        let query = new URLSearchParams(formData);
        let response;
        let textData;
        let quizDataArray;
        let username = query.get("username");
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
            for (let i = 0; i < quizDataArray.length; i++) {
                let quizSlot = document.createElement("LI");
                quizList.appendChild(quizSlot);
                quizSlot.className = "quizSlot";
                quizSlot.innerHTML = JSON.stringify(quizDataArray[i]._id);
            }
        }
    }
})(nerdquiz = exports.nerdquiz || (exports.nerdquiz = {}));
//# sourceMappingURL=script.js.map