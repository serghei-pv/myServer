"use strict";
var nerdquiz;
(function (nerdquiz) {
    //index.html
    let loginButton = document.getElementById("loginButton");
    let loginVariable = "login";
    //create.html
    let createQuizForm = document.getElementById("createQuizForm");
    let modal = document.getElementById("modal");
    let modaltext = document.getElementById("modaltext");
    let createQuestionsCounter = 1;
    let filledTextAreaArray = [];
    let createQuizVariable = "create";
    let saveQuizVariable = "save";
    let loadQuizVariable = "load";
    //host.html
    let questionDisplay = document.getElementById("questionDisplay");
    let answerDisplay = document.getElementById("answerDisplay");
    let questionNumberDisplay = document.getElementById("questionNumberDisplay");
    let nextQuestionButton = document.getElementById("nextQuestion");
    let previousQuestionButton = document.getElementById("previousQuestion");
    //host.html & participant.html
    let quizTop = document.getElementById("quizTop");
    let quizBottom = document.getElementById("quizBottom");
    let questionCounter = 0;
    //global
    let currentPage = window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1);
    let storageQuiz = sessionStorage.getItem("quiz");
    let ws = new WebSocket("wss://wb-s.herokuapp.com/");
    let host = "https://wb-s.herokuapp.com/";
    // let ws = new WebSocket("ws://localhost:8100/");
    // let host: string = "http://localhost:8100/";
    window.addEventListener("load", waitForWebsocket);
    function waitForWebsocket() {
        setTimeout(function () {
            if (ws.readyState === 1) {
                pageCheck();
            }
            else {
                waitForWebsocket();
            }
        }, 5);
    }
    function pageCheck() {
        switch (currentPage) {
            case "":
                loginButton.addEventListener("click", processLogin);
                break;
            case "index.html":
                loginButton.addEventListener("click", processLogin);
                break;
            case "rooms.html":
                ws.send(JSON.stringify({
                    type: "quizList",
                }));
                ws.addEventListener("message", ({ data }) => {
                    data = JSON.parse(data);
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].question != undefined) {
                            let quizList = document.getElementById("quizList");
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
                            quizID.innerHTML = data[i]._id;
                            quizQuestionAmount.innerHTML = data[i].question.length;
                            quizSubmitter.innerHTML = data[i].username;
                            quizList.insertBefore(quizRow, quizList.childNodes[2]);
                            quizRow.appendChild(quizNumber);
                            quizRow.appendChild(quizID);
                            quizRow.appendChild(quizQuestionAmount);
                            quizRow.appendChild(quizSubmitter);
                            function loadQuiz() {
                                if (sessionStorage.getItem("username") == data[i].username) {
                                    sessionStorage.setItem("quiz", JSON.stringify(data[i]));
                                    window.location.href = "./host.html";
                                }
                                else {
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
                let addQuestionButton = document.getElementById("addQuestionButton");
                let removeQuestionButton = document.getElementById("removeQuestionButton");
                let createQuiz = document.getElementById("createQuiz");
                let saveQuiz = document.getElementById("saveQuiz");
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
                ws.send(JSON.stringify({
                    type: "participant",
                    username: sessionStorage.getItem("username"),
                    roomnumber: sessionStorage.getItem("roomNumber"),
                }));
                break;
        }
    }
    function hostQuiz() {
        let nextQuestion = document.getElementById("nextQuestion");
        let quizFooter = document.getElementById("quizFooter");
        nextQuestion.addEventListener("click", processContinue);
        quizFooter.appendChild(questionNumberDisplay);
        quizTop.appendChild(questionDisplay);
        quizTop.appendChild(answerDisplay);
        displayQuestion();
    }
    function manageQuiz() {
        previousQuestionButton.addEventListener("click", previousQuestion);
        nextQuestionButton.addEventListener("click", nextQuestion);
        ws.addEventListener("message", ({ data }) => {
            data = JSON.parse(data);
            for (let i = 0; i < data.length; i++) {
                if (sessionStorage.getItem("roomNumber") == data[i].roomnumber) {
                    let leftMain = document.getElementById("leftMain");
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
                    let subPoint = { type: "change", username: data[i].username, points: -1 };
                    let subHalfPoint = { type: "change", username: data[i].username, points: -0.5 };
                    let addHalfPoint = { type: "change", username: data[i].username, points: +0.5 };
                    let addPoint = { type: "change", username: data[i].username, points: +1 };
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
                        function showParticipantAnswer() {
                            if (quizBottom.childNodes.length != 0) {
                                let lastChildQuizBottom = quizBottom.lastChild;
                                quizBottom.removeChild(lastChildQuizBottom);
                            }
                            quizBottom.appendChild(answerContainer);
                            participantAnswerName.innerHTML = data[i].username;
                            participantAnswer.innerHTML = data[i].answer;
                            ws.send(JSON.stringify({}));
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
                    let iName = document.getElementById("name" + i);
                    let iPoints = document.getElementById("points" + i);
                    if (iName.innerHTML != data[i].username || iPoints.innerHTML != data[i].points) {
                        iName.innerHTML = data[i].username;
                        iPoints.innerHTML = data[i].points;
                    }
                    if (data[i].answer != "") {
                        iName.classList.add("blue");
                    }
                    else {
                        iName.classList.remove("blue");
                    }
                    let iAnswerName = document.getElementById("answerName" + i);
                    let iAnswer = document.getElementById("answer" + i);
                    if (quizBottom.childNodes.length != 0) {
                        if (iAnswerName != null && iAnswer != null) {
                            if (iAnswerName.innerHTML != data[i].username || iAnswer.innerHTML != data[i].answer) {
                                iAnswerName.innerHTML = data[i].username;
                                iAnswer.innerHTML = data[i].answer;
                            }
                        }
                    }
                }
                else {
                    i--;
                    data.splice(i, 1);
                }
            }
        });
    }
    function participateQuiz() {
        let answerForm = document.createElement("FORM");
        let textArea = document.createElement("TEXTAREA");
        let submitButton = document.createElement("BUTTON");
        let pointsDisplay = document.createElement("P");
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
        function autoExpand() {
            let heightLimit = 60;
            textArea.style.height = "";
            textArea.style.height = Math.min(textArea.scrollHeight, heightLimit) + "px";
        }
        ws.addEventListener("message", ({ data }) => {
            let answerButton = document.getElementById("answerButton");
            let answerField = document.querySelector("TEXTAREA");
            for (let i = 0; i < JSON.parse(data).length; i++) {
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
        window.scrollTo(0, document.body.scrollHeight);
        questionArea.focus();
        createQuestionsCounter++;
    }
    function removeQuestion() {
        let lastChildcreateQuizForm = createQuizForm.lastChild;
        if (createQuestionsCounter > 2) {
            for (let i = 0; i < 1; i++) {
                createQuizForm.removeChild(lastChildcreateQuizForm);
                filledTextAreaArray.length -= 2;
            }
            createQuestionsCounter--;
        }
    }
    function displayQuestion() {
        questionNumberDisplay.innerHTML = JSON.stringify(questionCounter + 1);
        questionDisplay.innerHTML = JSON.parse(storageQuiz).question[questionCounter];
        answerDisplay.innerHTML = "Answer: " + JSON.parse(storageQuiz).answer[questionCounter];
    }
    function previousQuestion() {
        questionCounter--;
        if (questionCounter == 0) {
            previousQuestionButton.style.visibility = "hidden";
        }
        nextQuestionButton.style.visibility = "visible";
        displayQuestion();
    }
    function nextQuestion() {
        questionCounter++;
        if (JSON.parse(storageQuiz).question[questionCounter + 1] == undefined) {
            nextQuestionButton.style.visibility = "hidden";
        }
        previousQuestionButton.style.visibility = "visible";
        displayQuestion();
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
            modal.style.display = "block";
            modaltext.style.color = "#00FF50";
            modaltext.innerHTML = "Quiz created!";
            setTimeout(function () {
                console.log("huh");
                window.location.href = "./rooms.html";
            }, 1000);
            filledTextAreaArray.length = 0;
        }
        else {
            modal.style.display = "block";
            modaltext.innerHTML = "Fill out everything!";
            setTimeout(function () {
                modal.style.display = "none";
            }, 3000);
        }
    }
    function processSaveQuiz() {
        modal.style.display = "block";
        modaltext.style.color = "#00FF50";
        modaltext.innerHTML = "Saved successfully!";
        setTimeout(function () {
            modaltext.style.color = "#FF1D19";
            modal.style.display = "none";
        }, 3000);
        try {
            processRequest(host, saveQuizVariable);
        }
        catch (e) {
            modal.style.display = "block";
            modaltext.innerHTML = "An error accured";
            setTimeout(function () {
                modal.style.display = "none";
            }, 3000);
        }
    }
    function processLoadQuiz() {
        processRequest(host, loadQuizVariable);
    }
    function processAnswer() {
        let answer = document.querySelector("textarea");
        let formData = new FormData(document.forms[0]);
        let query = new URLSearchParams(formData);
        if (answer.value != "") {
            ws.send(JSON.stringify({
                type: "answer",
                username: sessionStorage.getItem("username"),
                answer: query.get("answer"),
            }));
        }
        else {
            console.log("test");
        }
    }
    function processContinue() {
        ws.send(JSON.stringify({
            type: "continue",
        }));
        quizBottom.innerHTML = "";
    }
    async function processRequest(_url, _pathname) {
        let formData = new FormData(document.forms[0]);
        let query = new URLSearchParams(formData);
        let response;
        let queryUsername = query.get("username");
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
                    sessionStorage.setItem("username", queryUsername);
                    window.location.href = "./pages/home.html";
                }
                break;
            case saveQuizVariable:
                let saveMessage = document.createElement("DIV");
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
                await fetch(_url, data);
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
                if (quiz.length > 0) {
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
        }
    }
})(nerdquiz || (nerdquiz = {}));
//# sourceMappingURL=script.js.map