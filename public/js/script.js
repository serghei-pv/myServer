"use strict";
var nerdquiz;
(function (nerdquiz) {
    //global
    let currentPage = window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1);
    let storageQuiz = sessionStorage.getItem("quiz");
    let loginButton = document.getElementById("loginButton");
    let loginVariable = "login";
    loginButton.addEventListener("click", processLogin);
    //create.html
    let createQuizForm = document.getElementById("createQuizForm");
    let modalCreate = document.getElementById("modalCreate");
    let modalLogin = document.getElementById("modalLogin");
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
    let ws = new WebSocket("wss://wb-s.herokuapp.com/");
    let host = "https://wb-s.herokuapp.com/";
    // let ws = new WebSocket("ws://localhost:8100/");
    // let host: string = "http://localhost:8100/";
    window.addEventListener("load", waitForWebsocket);
    window.addEventListener("load", checkLogin);
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
    function checkLogin() {
        if (sessionStorage.getItem("login") != "true") {
            let loginInput = document.querySelector(".loginInput");
            modalLogin.style.display = "block";
            loginInput.focus();
        }
    }
    function pageCheck() {
        switch (currentPage) {
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
                    // let leftMain: HTMLUListElement = <HTMLUListElement>document.getElementById("leftMain");
                    let participantContainer = document.createElement("DIV");
                    let participantName = document.createElement("P");
                    let participantPoints = document.createElement("P");
                    // let answerContainer: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
                    // let participantAnswerName: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
                    let participantAnswer = document.createElement("P");
                    let participantSubPoint = document.createElement("BUTTON");
                    let participantAddPoint = document.createElement("BUTTON");
                    let participantSubHalfPoint = document.createElement("BUTTON");
                    let participantAddHalfPoint = document.createElement("BUTTON");
                    let participantUnlock = document.createElement("BUTTON");
                    let rowOne = document.createElement("DIV");
                    let rowTwo = document.createElement("DIV");
                    let rowThree = document.createElement("DIV");
                    if (i == quizBottom.childNodes.length) {
                        participantContainer.id = "participantContainer" + i;
                        participantName.id = "name" + i;
                        participantPoints.id = "points" + i;
                        participantAnswer.id = "answer" + i;
                        participantContainer.className = "participantContainer";
                        rowOne.className = "rowOne";
                        rowTwo.className = "rowTwo";
                        rowThree.className = "rowThree";
                        participantName.className = "participantName";
                        participantPoints.className = "participantPoints";
                        participantSubPoint.className = "participantSubPoint";
                        participantSubHalfPoint.className = "participantSubHalfPoint";
                        participantUnlock.className = "participantUnlock";
                        participantAddHalfPoint.className = "participantAddHalfPoint";
                        participantAddPoint.className = "participantAddPoint";
                        participantAnswer.className = "participantAnswer";
                        quizBottom.appendChild(participantContainer);
                        participantContainer.appendChild(rowOne);
                        participantContainer.appendChild(rowTwo);
                        participantContainer.appendChild(rowThree);
                        rowOne.appendChild(participantName);
                        rowOne.appendChild(participantPoints);
                        rowTwo.appendChild(participantSubPoint);
                        rowTwo.appendChild(participantSubHalfPoint);
                        rowTwo.appendChild(participantUnlock);
                        rowTwo.appendChild(participantAddHalfPoint);
                        rowTwo.appendChild(participantAddPoint);
                        rowThree.appendChild(participantAnswer);
                        participantName.innerHTML = data[i].username;
                        participantSubPoint.innerHTML = "-1";
                        participantSubHalfPoint.innerHTML = "-0.5";
                        participantAddHalfPoint.innerHTML = "+0.5";
                        participantAddPoint.innerHTML = "+1";
                        participantUnlock.innerHTML = "clear";
                        participantSubPoint.addEventListener("click", subPoints);
                        participantSubHalfPoint.addEventListener("click", subHalfPoints);
                        participantAddHalfPoint.addEventListener("click", addHalfPoints);
                        participantAddPoint.addEventListener("click", addPoints);
                        participantUnlock.addEventListener("click", unlock);
                    }
                    let subPoint = { type: "change", username: data[i].username, points: -1 };
                    let subHalfPoint = { type: "change", username: data[i].username, points: -0.5 };
                    let addHalfPoint = { type: "change", username: data[i].username, points: +0.5 };
                    let addPoint = { type: "change", username: data[i].username, points: +1 };
                    let unlockAnswer = { type: "change", username: data[i].username, lock: "false" };
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
                    let iParticipant = document.getElementById("participantContainer" + i);
                    let iPoints = document.getElementById("points" + i);
                    let iAnswer = document.getElementById("answer" + i);
                    iPoints.innerHTML = data[i].points;
                    iAnswer.innerHTML = data[i].answer;
                    if (data[i].answer != "") {
                        iParticipant.classList.add("blueBorder");
                    }
                    else {
                        iParticipant.classList.remove("blueBorder");
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
        let textArea = document.getElementById("textArea");
        let answerButton = document.getElementById("answerButton");
        let answerPoints = document.getElementById("answerPoints");
        let points;
        textArea.addEventListener("input", autoExpand);
        answerButton.addEventListener("click", processAnswer);
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
                        answerPoints.innerHTML = points + " / " + sessionStorage.getItem("quizLength");
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
        if (sessionStorage.getItem("login") == "true") {
            questionArea.focus();
        }
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
        questionNumberDisplay.innerHTML = JSON.stringify(questionCounter + 1) + " / " + JSON.parse(storageQuiz).question.length;
        questionDisplay.innerHTML = JSON.parse(storageQuiz).question[questionCounter];
        answerDisplay.innerHTML = JSON.parse(storageQuiz).answer[questionCounter];
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
            nextQuestionButton.innerHTML = "Finish";
            nextQuestionButton.removeEventListener("click", nextQuestion);
            nextQuestionButton.addEventListener("click", finishQuiz);
        }
        function finishQuiz() {
            ws.send(JSON.stringify({
                type: "winner",
                roomnumber: sessionStorage.getItem("roomNumber"),
            }));
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
            modalCreate.style.display = "block";
            modaltext.style.color = "#00FF50";
            modaltext.innerHTML = "Quiz created!";
            setTimeout(function () {
                console.log("huh");
                window.location.href = "./rooms.html";
            }, 1000);
            filledTextAreaArray.length = 0;
        }
        else {
            modalCreate.style.display = "block";
            modaltext.innerHTML = "Fill out everything!";
            setTimeout(function () {
                modalCreate.style.display = "none";
            }, 3000);
        }
    }
    function processSaveQuiz() {
        modalCreate.style.display = "block";
        modaltext.style.color = "#00FF50";
        modaltext.innerHTML = "Saved successfully!";
        setTimeout(function () {
            modaltext.style.color = "#FF1D19";
            modalCreate.style.display = "none";
        }, 3000);
        try {
            processRequest(host, saveQuizVariable);
        }
        catch (e) {
            modalCreate.style.display = "block";
            modaltext.innerHTML = "An error accured";
            setTimeout(function () {
                modalCreate.style.display = "none";
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
                if (currentPage == "create.html") {
                    formData = new FormData(document.forms[1]);
                    query = new URLSearchParams(formData);
                }
                data = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: query.get("username"),
                    }),
                };
                response = await fetch(_url, data);
                textData = await response.text();
                if (textData == query.get("username")) {
                    sessionStorage.setItem("login", "true");
                    sessionStorage.setItem("username", queryUsername);
                    modalLogin.style.display = "none";
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