const apiURL = "https://opentdb.com/api.php?amount=10&category=19&type=multiple";
const quizBox = document.getElementById("quiz-box");
const submitBtn = document.getElementById("submit-btn");
const revealBtn = document.getElementById("reveal-btn");
const resultBox = document.getElementById("result");
const retryBtn = document.getElementById("retry-btn");
const nextBtn = document.getElementById("next-btn");

const userName = localStorage.getItem("quizUser") || "Player";
const totalLevels = Number(localStorage.getItem("quizLevels")) || 1;
let currentLevel = Number(localStorage.getItem("currentLevel")) || 1;
let scores = JSON.parse(localStorage.getItem("scores")) || [];
let skippedLevels = localStorage.getItem("skippedLevels") === "true"; 

document.getElementById("welcome-msg").innerText = `Welcome, ${userName}!`;
document.getElementById("level-num").innerText = currentLevel;

let questions = [];

fetch(apiURL)
    .then(response => response.json())
    .then(data => {
        questions = data.results;
        displayQuestions();
    });

function displayQuestions() {
    quizBox.innerHTML = "";
    questions.forEach((q, index) => {
        const answers = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);

        const questionHTML = `
            <div class="question-box">
                <p class="question">${index + 1}. ${q.question}</p>
                <div class="options">
                    ${answers.map(answer => `
                        <label class="option">
                            <input type="radio" name="question${index}" value="${answer}">
                            ${answer}
                        </label>
                    `).join('')}
                </div>
                <p class="correct-answer" style="display: none;">Correct: <strong>${q.correct_answer}</strong></p>
            </div>
        `;
        quizBox.innerHTML += questionHTML;
    });
}

// Reveal answers and allow skipping
revealBtn.addEventListener("click", () => {
    document.querySelectorAll(".correct-answer").forEach(ans => ans.style.display = "block");
    submitBtn.style.display = "none";
    nextBtn.style.display = "block";
    skippedLevels = true;
    localStorage.setItem("skippedLevels", "true");
});

// Submit quiz
submitBtn.addEventListener("click", () => {
    let score = 0;
    document.querySelectorAll(".question-box").forEach((qBox, index) => {
        const selected = qBox.querySelector("input[name='question" + index + "']:checked");
        const correctAnswer = questions[index].correct_answer;

        if (selected) {
            if (selected.value === correctAnswer) {
                score++;
                selected.parentElement.classList.add("correct");
            } else {
                selected.parentElement.classList.add("incorrect");
            }
        }
    });

    resultBox.innerHTML = `Level ${currentLevel}: You scored ${score}/10!`;
    scores.push(score);
    localStorage.setItem("scores", JSON.stringify(scores));

    submitBtn.style.display = "none";
    revealBtn.style.display = "none";
    retryBtn.style.display = score >= 6 ? "none" : "block";
    nextBtn.style.display = score >= 6 && currentLevel < totalLevels ? "block" : "none";

    if (currentLevel >= totalLevels) {
        window.location.href = "certificate.html";
    }
});

retryBtn.addEventListener("click", () => window.location.reload());
nextBtn.addEventListener("click", () => {
    localStorage.setItem("currentLevel", currentLevel + 1);
    window.location.reload();
});
