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
            hostQuiz();
            document.getElementById("previousQuestion").addEventListener("click", previousQuestion);
            document.getElementById("nextQuestion").addEventListener("click", nextQuestion);
            ws.addEventListener("message", ({ data }) => {
                for (let i = 0; i < JSON.parse(data).length; i++) {
                    let particpantTable = document.createElement("P");
                    let particpantTable2 = document.createElement("DIV");
                    let participantName = document.createElement("DIV");
                    let participantPoints = document.createElement("DIV");
                    let participantSubPoint = document.createElement("DIV");
                    let participantAddPoint = document.createElement("DIV");
                    let participantAnswer = document.createElement("DIV");
                    let subParticipant = { username: JSON.parse(data)[i].username, points: JSON.parse(data)[i].points - 1 };
                    let addParticipant = { username: JSON.parse(data)[i].username, points: JSON.parse(data)[i].points + 1 };
                    if (JSON.parse(data).length > participantsArea.childNodes.length && i == participantsArea.childNodes.length) {
                        participantName.id = "name" + i;
                        participantPoints.id = "points" + i;
                        participantAnswer.id = "answer" + i;
                        participantSubPoint.id = "subPoint" + i;
                        participantAddPoint.id = "addPoint" + i;
                        particpantTable.className = "particpantTable";
                        particpantTable2.className = "particpantTable2";
                        participantPoints.className = "participantPoints";
                        participantName.className = "participantName";
                        participantSubPoint.className = "participantSubPoint";
                        participantAddPoint.className = "participantAddPoint";
                        participantAnswer.className = "participantAnswer";
                        participantsArea.appendChild(particpantTable);
                        particpantTable.appendChild(particpantTable2);
                        particpantTable2.appendChild(participantName);
                        particpantTable2.appendChild(participantSubPoint);
                        particpantTable2.appendChild(participantAddPoint);
                        particpantTable2.appendChild(participantPoints);
                        particpantTable.appendChild(participantAnswer);
                    }
                    document.getElementById("subPoint" + i).addEventListener("click", subPoints);
                    document.getElementById("addPoint" + i).addEventListener("click", addPoints);
                    function subPoints() {
                        if (JSON.parse(data)[i].points > 0) {
                            ws.send(JSON.stringify(subParticipant));
                        }
                    }
                    function addPoints() {
                        ws.send(JSON.stringify(addParticipant));
                    }
                    participantSubPoint.innerHTML = "-";
                    participantAddPoint.innerHTML = "+";
                    document.getElementById("name" + i).innerHTML = JSON.parse(data)[i].username;
                    document.getElementById("points" + i).innerHTML = JSON.parse(data)[i].points;
                    document.getElementById("answer" + i).innerHTML = JSON.parse(data)[i].answer;
                }
            });
        }
        if (sessionStorage.getItem("user") != quiz.user) {
            participateQuiz();
            processParticipant();
        }
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
    function displayQuestion() {
        questionNumberDisplay.innerHTML = JSON.stringify(questionCounter + 1);
        questionDisplay.innerHTML = quiz.question[questionCounter];
        answerDisplay.innerHTML = "Answer: " + quiz.answer[questionCounter];
    }
    function hostQuiz() {
        document.getElementById("nextQuestion").style.visibility = "visible";
        quizFooter.appendChild(questionNumberDisplay);
        QAArea.appendChild(questionDisplay);
        QAArea.appendChild(answerDisplay);
        displayQuestion();
    }
    function participateQuiz() {
        let answerForm = document.createElement("FORM");
        let textArea = document.createElement("TEXTAREA");
        let submitButton = document.createElement("BUTTON");
        QAArea.appendChild(answerForm);
        answerForm.appendChild(textArea);
        answerForm.appendChild(submitButton);
        textArea.className = "participantsTextarea";
        textArea.name = "answer";
        submitButton.className = "submitButton";
        submitButton.innerHTML = "Answer";
        submitButton.type = "button";
        submitButton.addEventListener("click", processAnswer);
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
                let quizSlot = document.createElement("LI");
                quizSlot.addEventListener("click", loadQuiz);
                quizList.appendChild(quizSlot);
                quizSlot.className = "quizSlot";
                quizSlot.innerHTML = quizDataArray[i]._id + " - <i>by " + quizDataArray[i].user + "</i>";
                function loadQuiz() {
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
    // if (currentPage == "quiz.html") {
    //   ws.addEventListener("connection", connection);
    // }
    // ws.addEventListener("message", ({ data }) => {
    //   console.log(data);
    // });
    // function connection(): void {
    //   let username: string = '{"username": sessionStorage.getItem("user")}';
    //   ws.send(username);
    // }
    // let username: string = "";
    // let points: number = 0;
    // let answer: string = "";
    // ws.addEventListener("message", ({ data }) => {
    //   let i: number;
    //   if (currentPage == "quiz.html") {
    //     for (i = 0; i < JSON.parse(data).length; i++) {
    //       let particpantTable: HTMLParagraphElement = <HTMLParagraphElement>document.createElement("P");
    //       let particpantTable2: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
    //       let participantName: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
    //       let participantPoints: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
    //       let participantSubPoint: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
    //       let participantAddPoint: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
    //       let participantAnswer: HTMLDivElement = <HTMLDivElement>document.createElement("DIV");
    //       if (JSON.parse(data).length > participantsArea.childNodes.length) {
    //         username = JSON.parse(data)[i].username;
    //         points = JSON.parse(data)[i].points;
    //         answer = JSON.parse(data)[i].answer;
    //         participantPoints.id = "points" + i;
    //         participantName.id = "name" + i;
    //         participantAnswer.id = "answer" + i;
    //         particpantTable.className = "particpantTable";
    //         particpantTable2.className = "particpantTable2";
    //         participantPoints.className = "participantPoints";
    //         participantName.className = "participantName";
    //         participantSubPoint.className = "participantSubPoint";
    //         participantAddPoint.className = "participantAddPoint";
    //         participantAnswer.className = "participantAnswer";
    //         participantsArea.appendChild(particpantTable);
    //         particpantTable.appendChild(particpantTable2);
    //         particpantTable2.appendChild(participantName);
    //         particpantTable2.appendChild(participantSubPoint);
    //         particpantTable2.appendChild(participantAddPoint);
    //         particpantTable2.appendChild(participantPoints);
    //         particpantTable.appendChild(participantAnswer);
    //       }
    //       if (participantSubPoint.innerHTML != "-") {
    //         participantSubPoint.innerHTML = "-";
    //       }
    //       if (participantAddPoint.innerHTML != "+") {
    //         participantAddPoint.innerHTML = "+";
    //       }
    //       if (username != JSON.parse(data)[i].username) {
    //         document.getElementById("name" + i).innerHTML = JSON.parse(data)[i].username;
    //       }
    //       if (points != JSON.parse(data)[i].points) {
    //         document.getElementById("points" + i).innerHTML = JSON.parse(data)[i].points;
    //       }
    //       if (answer != JSON.parse(data)[i].answer) {
    //         document.getElementById("answer" + i).innerHTML = JSON.parse(data)[i].answer;
    //       }
    //       username = JSON.parse(data)[i].username;
    //       points = JSON.parse(data)[i].points;
    //       answer = JSON.parse(data)[i].answer;
    //       if (i == JSON.parse(data).length - 1) {
    //         i = 0;
    //       }
    //     }
    //   }
    // });
})(nerdquiz || (nerdquiz = {}));
//# sourceMappingURL=script.js.map