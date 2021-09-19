"use strict";
var nerdquiz;
(function (nerdquiz) {
    let currentPage = window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1);
    let indexMenu = document.getElementById("indexMenu");
    let menuCenter = document.getElementById("menuCenter");
    let indexMain = document.getElementById("indexMain");
    let leftMain = document.getElementById("leftMain");
    let loginButton = document.getElementById("loginButton");
    let createQuizForm = document.getElementById("createQuizForm");
    let addQuestionButton = document.getElementById("addQuestionButton");
    let removeQuestionButton = document.getElementById("removeQuestionButton");
    let createQuiz = document.getElementById("createQuiz");
    let saveQuiz = document.getElementById("saveQuiz");
    let quizList = document.getElementById("quizList");
    let quizTop = document.getElementById("quizTop");
    let quizBottom = document.getElementById("quizBottom");
    let quizFooter = document.getElementById("quizFooter");
    let questionDisplay = document.getElementById("questionDisplay");
    let answerDisplay = document.getElementById("answerDisplay");
    let questionNumberDisplay = document.getElementById("questionNumberDisplay");
    let createQuestionsCounter = 1;
    let questionCounter = 0;
    let heightLimit = 50;
    let filledTextAreaArray = new Array();
    let ws = new WebSocket("wss://wb-s.herokuapp.com/");
    let host = "https://wb-s.herokuapp.com/";
    // let ws = new WebSocket("ws://localhost:8100/");
    // let host: string = "http://localhost:8100/";
    let loginVariable = "login";
    let createQuizVariable = "create";
    let saveQuizVariable = "save";
    let loadQuizVariable = "load";
    let quizListVariable = "quizList";
    let participantVariable = "participant";
    let answerVariable = "answer";
    let continueVariable = "continue";
    if (sessionStorage.getItem("login") != "true") {
        indexMenu.style.visibility = "hidden";
    }
    if (currentPage == "index.html" || currentPage == "") {
        loginButton.addEventListener("click", processLogin);
        if (sessionStorage.getItem("login") == "true") {
            for (let i = indexMain.childNodes.length; i > 0; i--) {
                indexMain.removeChild(indexMain.lastChild);
            }
        }
    }
    if (currentPage == "rooms.html") {
        window.addEventListener("load", processQuizList);
    }
    if (currentPage == "create.html") {
        window.addEventListener("load", processLoadQuiz);
        addQuestionButton.addEventListener("click", addQuestion);
        removeQuestionButton.addEventListener("click", removeQuestion);
        createQuiz.addEventListener("click", processCreateQuiz);
        saveQuiz.addEventListener("click", processSaveQuiz);
    }
    if (currentPage == "quiz.html") {
        if (sessionStorage.getItem("quiz") != null) {
            hostQuiz();
            manageQuiz();
        }
        if (sessionStorage.getItem("quiz") == null) {
            participateQuiz();
            processParticipant();
        }
        let roomNumber = document.createElement("P");
        roomNumber.innerHTML = sessionStorage.getItem("roomNumber");
        roomNumber.id = "roomNumber";
        menuCenter.appendChild(roomNumber);
    }
    function hostQuiz() {
        document.getElementById("nextQuestion").style.visibility = "visible";
        document.getElementById("nextQuestion").addEventListener("click", processContinue);
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
                if (sessionStorage.getItem("roomNumber") == JSON.parse(data)[i].roomnumber) {
                    let participantContainer = document.createElement("LI");
                    let participantName = document.createElement("DIV");
                    let participantPoints = document.createElement("DIV");
                    let answerContainer = document.createElement("DIV");
                    let participantAnswerName = document.createElement("DIV");
                    let participantAnswer = document.createElement("DIV");
                    let participantSubPoint = document.createElement("BUTTON");
                    let participantAddPoint = document.createElement("BUTTON");
                    let participantSubHalfPoint = document.createElement("BUTTON");
                    let participantAddHalfPoint = document.createElement("BUTTON");
                    let participantUnlock = document.createElement("BUTTON");
                    let subPoint = { username: JSON.parse(data)[i].username, points: -1 };
                    let subHalfPoint = { username: JSON.parse(data)[i].username, points: -0.5 };
                    let addHalfPoint = { username: JSON.parse(data)[i].username, points: +0.5 };
                    let addPoint = { username: JSON.parse(data)[i].username, points: +1 };
                    let unlockAnswer = { username: JSON.parse(data)[i].username, lock: "false" };
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
                        ws.send(JSON.stringify(subPoint));
                    }
                    function addPoints() {
                        ws.send(JSON.stringify(addPoint));
                    }
                    function subHalfPoints() {
                        ws.send(JSON.stringify(subHalfPoint));
                    }
                    function addHalfPoints() {
                        ws.send(JSON.stringify(addHalfPoint));
                    }
                    function unlock() {
                        ws.send(JSON.stringify(unlockAnswer));
                    }
                    if (document.getElementById("name" + i).innerHTML != JSON.parse(data)[i].username ||
                        document.getElementById("points" + i).innerHTML != JSON.parse(data)[i].points) {
                        document.getElementById("name" + i).innerHTML = JSON.parse(data)[i].username;
                        document.getElementById("points" + i).innerHTML = JSON.parse(data)[i].points;
                    }
                    if (JSON.parse(data)[i].answer != "") {
                        document.getElementById("name" + i).classList.add("blue");
                    }
                    else {
                        document.getElementById("name" + i).classList.remove("blue");
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
            }
        });
    }
    function participateQuiz() {
        let answerForm = document.createElement("FORM");
        let textArea = document.createElement("TEXTAREA");
        let submitButton = document.createElement("BUTTON");
        let pointsDisplay = document.createElement("P");
        let answerField = document.querySelector("textarea");
        let points;
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
        ws.addEventListener("message", ({ data }) => {
            for (let i = 0; i < JSON.parse(data).length; i++) {
                if (JSON.parse(data)[i].username == sessionStorage.getItem("user")) {
                    if (points != JSON.parse(data)[i].points) {
                        points = JSON.parse(data)[i].points;
                        pointsDisplay.innerHTML = points + " / " + sessionStorage.getItem("quizLength");
                    }
                    if (JSON.parse(data)[i].lock == "true") {
                        document.getElementById("answerButton").classList.add("lock");
                        answerField = document.querySelector("textarea");
                        answerField.classList.add("lock");
                        answerField.value = JSON.parse(data)[i].answer;
                    }
                    if (JSON.parse(data)[i].lock == "false") {
                        document.getElementById("answerButton").classList.remove("lock");
                        if (answerField == document.querySelector("textarea")) {
                            answerField.classList.remove("lock");
                            answerField.value = "";
                            answerField = undefined;
                        }
                    }
                }
            }
        });
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
        questionArea.addEventListener("input", autoExpand);
        answerArea.addEventListener("input", autoExpand);
        window.scrollTo(0, document.body.scrollHeight);
        createQuestionsCounter++;
    }
    function removeQuestion() {
        if (createQuestionsCounter > 2) {
            for (let i = 0; i < 1; i++) {
                createQuizForm.removeChild(createQuizForm.lastChild);
                filledTextAreaArray.length -= 2;
            }
            createQuestionsCounter--;
        }
    }
    function displayQuestion() {
        questionNumberDisplay.innerHTML = JSON.stringify(questionCounter + 1);
        questionDisplay.innerHTML = JSON.parse(sessionStorage.getItem("quiz")).question[questionCounter];
        answerDisplay.innerHTML = "Answer: " + JSON.parse(sessionStorage.getItem("quiz")).answer[questionCounter];
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
        if (JSON.parse(sessionStorage.getItem("quiz")).question[questionCounter + 1] == undefined) {
            document.getElementById("nextQuestion").style.visibility = "hidden";
        }
        document.getElementById("previousQuestion").style.visibility = "visible";
        displayQuestion();
    }
    function autoExpand() {
        document.querySelector("textarea").style.height = "";
        document.querySelector("textarea").style.height = Math.min(document.querySelector("textarea").scrollHeight, heightLimit) + "px";
    }
    function processLogin() {
        processRequest(host, loginVariable);
    }
    function processCreateQuiz() {
        let filledTextArea = 0;
        for (let i = 0; i < filledTextAreaArray.length; i++) {
            if (filledTextAreaArray[i].value != "") {
                filledTextArea++;
            }
        }
        if (filledTextAreaArray.length == filledTextArea) {
            processRequest(host, createQuizVariable);
            filledTextAreaArray.length = 0;
        }
        else {
            let alertMessage = document.createElement("SPAN");
            alertMessage.className = "alertMessage";
            alertMessage.innerHTML = "Fill Out Everything!";
            menuCenter.appendChild(alertMessage);
            if (menuCenter.childNodes.length > 1) {
                menuCenter.removeChild(menuCenter.firstChild);
            }
        }
    }
    function processSaveQuiz() {
        processRequest(host, saveQuizVariable);
    }
    function processLoadQuiz() {
        processRequest(host, loadQuizVariable);
    }
    function processQuizList() {
        processRequest(host, quizListVariable);
    }
    function processParticipant() {
        processRequest(host, participantVariable);
    }
    function processAnswer() {
        if (document.querySelector("textarea").value != "") {
            processRequest(host, answerVariable);
        }
        else {
            console.log("test");
        }
    }
    function processContinue() {
        processRequest(host, continueVariable);
        quizBottom.innerHTML = "";
    }
    async function processRequest(_url, _pathname) {
        let formData = new FormData(document.forms[0]);
        let query = new URLSearchParams(formData);
        let response;
        let textData;
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
                    sessionStorage.setItem("user", query.get("username"));
                    window.location.href = "./index.html";
                }
                break;
            case saveQuizVariable:
                let saveMessage = document.createElement("SPAN");
                saveMessage.className = "alertMessage";
                _url += saveQuizVariable;
                data = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: sessionStorage.getItem("user"),
                        ready: "false",
                        question: query.getAll("question"),
                        answer: query.getAll("answer"),
                    }),
                };
                try {
                    response = await fetch(_url, data);
                    saveMessage.innerHTML = "Saved succefully";
                    menuCenter.appendChild(saveMessage);
                }
                catch (e) {
                    saveMessage.innerHTML = "Quiz is too long! Save failed";
                    menuCenter.appendChild(saveMessage);
                }
                if (menuCenter.childNodes.length > 1) {
                    menuCenter.removeChild(menuCenter.firstChild);
                }
                break;
            case createQuizVariable:
                _url += createQuizVariable;
                data = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: sessionStorage.getItem("user"),
                        ready: "true",
                        question: query.getAll("question"),
                        answer: query.getAll("answer"),
                    }),
                };
                await fetch(_url, data);
                window.location.href = "../pages/create.html";
                break;
            case loadQuizVariable:
                _url += loadQuizVariable;
                data = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: sessionStorage.getItem("user"),
                    }),
                };
                response = await fetch(_url, data);
                let quiz = await response.json();
                if (quiz != "0") {
                    for (let i = 1; i <= quiz[1].length; i++) {
                        addQuestion();
                        let localQuestionArea = document.getElementById("questionArea" + i);
                        let localAnswerArea = document.getElementById("answerArea" + i);
                        localQuestionArea.value = quiz[0][i - 1];
                        localAnswerArea.value = quiz[1][i - 1];
                    }
                }
                else {
                    addQuestion();
                }
                break;
            case quizListVariable:
                _url += quizListVariable;
                response = await fetch(_url, { method: "POST" });
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
                            sessionStorage.setItem("quiz", JSON.stringify(quizDataArray[i]));
                        }
                        else {
                            sessionStorage.setItem("quizLength", quizDataArray[i].question.length);
                            if (sessionStorage.getItem("quiz") != null) {
                                sessionStorage.removeItem("quiz");
                            }
                        }
                        sessionStorage.setItem("roomNumber", quizDataArray[i]._id);
                        window.location.href = "../pages/quiz.html";
                    }
                }
                break;
            case participantVariable:
                _url += participantVariable;
                data = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: sessionStorage.getItem("user"),
                        roomnumber: sessionStorage.getItem("roomNumber"),
                    }),
                };
                await fetch(_url, data);
                break;
            case answerVariable:
                _url += answerVariable;
                data = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: sessionStorage.getItem("user"),
                        answer: query.get("answer"),
                    }),
                };
                await fetch(_url, data);
                break;
            case continueVariable:
                _url += continueVariable;
                await fetch(_url, { method: "POST" });
        }
    }
})(nerdquiz || (nerdquiz = {}));
//# sourceMappingURL=script.js.map