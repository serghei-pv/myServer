"use strict";
var nerdquiz;
(function (nerdquiz) {
    let ws = new WebSocket("ws://localhost:8100/");
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
    let QAArea = document.getElementById("QAArea");
    let quizFooter = document.getElementById("quizFooter");
    let questionDisplay = document.getElementById("questionDisplay");
    let answerDisplay = document.getElementById("answerDisplay");
    let questionNumberDisplay = document.getElementById("questionNumberDisplay");
    let participantsArea = document.getElementById("participantsArea");
    let createQuestionsCounter = 2;
    let questionCounter = 0;
    let host = "http://localhost:8100/";
    let connectionVariable = "connected";
    let loginVariable = "login";
    let registerVariable = "register";
    let createQuizVariable = "create";
    let quizListVariable = "quizList";
    if (sessionStorage.getItem("login") != "true") {
        for (let i = indexMenuRight.childNodes.length; i > 0; i--) {
            indexMenuRight.removeChild(indexMenuRight.lastChild);
        }
    }
    if (currentPage == "index.html") {
        registerButton.addEventListener("click", processRegistration);
        loginButton.addEventListener("click", processLogin);
        if (sessionStorage.getItem("login") == "true") {
            window.addEventListener("load", preocessConnection);
            for (let i = indexMain.childNodes.length; i > 0; i--) {
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
    function preocessConnection() {
        processRequest("ws://localhost:8100/", connectionVariable);
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
    function startQuiz() {
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
    function participateQuiz() {
        let textArea = document.createElement("TEXTAREA");
        let submitButton = document.createElement("BUTTON");
        QAArea.appendChild(textArea);
        QAArea.appendChild(submitButton);
        textArea.className = "participantsTextarea";
        submitButton.className = "submitButton";
        submitButton.innerHTML = "Answer";
    }
    async function processRequest(_url, _pathname) {
        let formData = new FormData(document.forms[0]);
        let query = new URLSearchParams(formData);
        let response;
        let textData;
        let username = query.get("username");
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
            for (let i = 0; i < quizDataArray.length; i++) {
                let quizSlot = document.createElement("LI");
                quizSlot.addEventListener("click", loadQuiz);
                quizList.appendChild(quizSlot);
                quizSlot.className = "quizSlot";
                quizSlot.innerHTML = quizDataArray[i]._id + " - <i>by " + quizDataArray[i].user + "</i>";
                function loadQuiz() {
                    window.location.href = "../pages/quiz.html";
                    localStorage.setItem("quiz", JSON.stringify(quizDataArray[i]));
                }
            }
        }
    }
    let number = 0;
    let username = "";
    let points = 0;
    let answer = "";
    ws.addEventListener("message", ({ data }) => {
        //console.log(JSON.parse(data).length);
        let i;
        if (currentPage == "quiz.html") {
            for (i = 0; i < JSON.parse(data).length; i++) {
                let particpantTable = document.createElement("TR");
                let particpantTable2 = document.createElement("TR");
                let participantNumber = document.createElement("TH");
                let participantName = document.createElement("TH");
                let participantPoints = document.createElement("TH");
                let participantSubPoint = document.createElement("TH");
                let participantAddPoint = document.createElement("TH");
                let participantAnswer = document.createElement("TH");
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
})(nerdquiz || (nerdquiz = {}));
//# sourceMappingURL=script.js.map