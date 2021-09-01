"use strict";
var nerdquiz;
(function (nerdquiz) {
    let ws = new WebSocket("ws://localhost:8100/");
    let currentPage = window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1);
    let indexMain = document.getElementById("indexMain");
    let leftMain = document.getElementById("leftMain");
    let rightMain = document.getElementById("rightMain");
    let indexMenu = document.getElementById("indexMenu");
    let registerButton = document.getElementById("registerButton");
    let loginButton = document.getElementById("loginButton");
    let createQuizForm = document.getElementById("createQuizForm");
    let addQuestionButton = document.getElementById("addQuestionButton");
    let removeQuestionButton = document.getElementById("removeQuestionButton");
    let createQuiz = document.getElementById("createQuiz");
    let quizList = document.getElementById("quizList");
    let quizTop = document.getElementById("quizTop");
    let quizBottom = document.getElementById("quizBottom");
    let quizFooter = document.getElementById("quizFooter");
    let questionDisplay = document.getElementById("questionDisplay");
    let answerDisplay = document.getElementById("answerDisplay");
    let questionNumberDisplay = document.getElementById("questionNumberDisplay");
    let createQuestionsCounter = 2;
    let questionCounter = 0;
    let quiz = JSON.parse(localStorage.getItem("quiz"));
    let host = "http://localhost:8100/";
    let connectionVariable = "connected";
    let loginVariable = "login";
    let registerVariable = "register";
    let createQuizVariable = "create";
    let quizListVariable = "quizList";
    let participantVariable = "participant";
    let answerVariable = "answer";
    if (sessionStorage.getItem("login") != "true") {
        indexMenu.style.visibility = "hidden";
    }
    if (currentPage == "index.html" || currentPage == "") {
        registerButton.addEventListener("click", processRegistration);
        loginButton.addEventListener("click", processLogin);
        if (sessionStorage.getItem("login") == "true") {
            window.addEventListener("load", processConnection);
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
        if (sessionStorage.getItem("user") == quiz.user) {
            hostQuiz();
            manageQuiz();
        }
        if (sessionStorage.getItem("user") != quiz.user) {
            participateQuiz();
            processParticipant();
        }
    }
    function hostQuiz() {
        document.getElementById("nextQuestion").style.visibility = "visible";
        quizFooter.appendChild(questionNumberDisplay);
        quizTop.appendChild(questionDisplay);
        quizTop.appendChild(answerDisplay);
        displayQuestion();
    }
    function manageQuiz() {
        document.getElementById("previousQuestion").addEventListener("click", previousQuestion);
        document.getElementById("nextQuestion").addEventListener("click", nextQuestion);
        ws.addEventListener("message", ({ data }) => {
            for (let i = 0; i < JSON.parse(data).length; i++) {
                let participantContainer = document.createElement("LI");
                let participantName = document.createElement("DIV");
                let participantPoints = document.createElement("DIV");
                let answerContainer = document.createElement("DIV");
                let participantAnswerName = document.createElement("DIV");
                let participantAnswer = document.createElement("DIV");
                let participantSubPoint = document.createElement("DIV");
                let participantAddPoint = document.createElement("DIV");
                let subParticipant = { username: JSON.parse(data)[i].username, points: -1 };
                let addParticipant = { username: JSON.parse(data)[i].username, points: +1 };
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
                    function showParticipantAnswer() {
                        if (quizBottom.childNodes.length != 0) {
                            quizBottom.removeChild(quizBottom.lastChild);
                        }
                        quizBottom.appendChild(answerContainer);
                        participantAnswerName.innerHTML = JSON.parse(data)[i].username;
                        participantAnswer.innerHTML = JSON.parse(data)[i].answer;
                    }
                }
                function subPoints() {
                    ws.send(JSON.stringify(subParticipant));
                }
                function addPoints() {
                    ws.send(JSON.stringify(addParticipant));
                }
                if (document.getElementById("name" + i).innerHTML != JSON.parse(data)[i].username ||
                    document.getElementById("points" + i).innerHTML != JSON.parse(data)[i].points) {
                    document.getElementById("name" + i).innerHTML = JSON.parse(data)[i].username;
                    document.getElementById("points" + i).innerHTML = JSON.parse(data)[i].points;
                }
                if (quizBottom.childNodes.length != 0) {
                    if (document.getElementById("answerName" + i) != null && document.getElementById("answer" + i) != null) {
                        if (document.getElementById("answerName" + i).innerHTML != JSON.parse(data)[i].username ||
                            document.getElementById("answer" + i).innerHTML != JSON.parse(data)[i].answer) {
                            document.getElementById("answerName" + i).innerHTML = JSON.parse(data)[i].username;
                            document.getElementById("answer" + i).innerHTML = JSON.parse(data)[i].answer;
                        }
                    }
                }
            }
        });
    }
    function participateQuiz() {
        let answerForm = document.createElement("FORM");
        let textArea = document.createElement("TEXTAREA");
        let submitButton = document.createElement("BUTTON");
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
    function addQuestion() {
        let createSlot = document.createElement("DIV");
        let numberArea = document.createElement("DIV");
        let questionArea = document.createElement("TEXTAREA");
        let answerArea = document.createElement("TEXTAREA");
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
    function removeQuestion() {
        if (createQuestionsCounter > 2) {
            for (let i = 0; i < 1; i++) {
                createQuizForm.removeChild(createQuizForm.lastChild);
            }
            createQuestionsCounter--;
        }
    }
    function displayQuestion() {
        questionNumberDisplay.innerHTML = JSON.stringify(questionCounter + 1);
        questionDisplay.innerHTML = quiz.question[questionCounter];
        answerDisplay.innerHTML = "Answer: " + quiz.answer[questionCounter];
    }
    function previousQuestion() {
        questionCounter--;
        if (questionCounter == 0) {
            document.getElementById("previousQuestion").style.visibility = "hidden";
        }
        document.getElementById("nextQuestion").style.visibility = "visible";
        displayQuestion();
    }
    function nextQuestion() {
        questionCounter++;
        if (quiz.question[questionCounter + 1] == undefined) {
            document.getElementById("nextQuestion").style.visibility = "hidden";
        }
        document.getElementById("previousQuestion").style.visibility = "visible";
        displayQuestion();
    }
    function processConnection() {
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
    function processParticipant() {
        processRequest(host, participantVariable);
    }
    function processAnswer() {
        processRequest(host, answerVariable);
    }
    async function processRequest(_url, _pathname) {
        let formData = new FormData(document.forms[0]);
        let query = new URLSearchParams(formData);
        let response;
        let textData;
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
            let quizDataArray = await response.json();
            for (let i = 0; i < quizDataArray.length; i++) {
                let quizRow = document.createElement("TR");
                let quizNumber = document.createElement("TD");
                let quizID = document.createElement("TD");
                let quizQuestionAmount = document.createElement("TD");
                let quizSubmitter = document.createElement("TD");
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
                function loadQuiz() {
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
})(nerdquiz || (nerdquiz = {}));
//# sourceMappingURL=script.js.map