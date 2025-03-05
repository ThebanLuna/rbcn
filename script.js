document.addEventListener("DOMContentLoaded", function () {
    let currentQuestionIndex = 0;
    let questions = [];
    let score = 0; // Lưu điểm số
    let answered = false; // Biến kiểm tra đã trả lời hay chưa

    async function loadQuestions() {
        try {
            const response = await fetch("questions.json");
            const data = await response.json();
            questions = data.quiz.questions;
            showQuestion();
        } catch (error) {
            console.error("Lỗi khi tải câu hỏi:", error);
        }
    }

    function showQuestion() {
        const questionText = document.getElementById("question-text");
        const answerOptions = document.getElementById("answer-options");
        const nextButton = document.getElementById("next-btn");

        if (currentQuestionIndex >= questions.length) {
            document.getElementById("quiz-container").innerHTML = `
                <h1>Bạn đã hoàn thành bài kiểm tra!</h1>
                <p>Điểm số của bạn: <strong>${score}/${questions.length}</strong></p>
            `;
            return;
        }

        let question = questions[currentQuestionIndex];
        questionText.textContent = question.question;
        answerOptions.innerHTML = "";
        answered = false; // Reset trạng thái chưa trả lời
        nextButton.style.display = "none"; // Ẩn nút tiếp tục

        if (question.type === "multiple_choice") {
            question.options.forEach(option => {
                let btn = document.createElement("button");
                btn.classList.add("answer-btn");
                btn.textContent = option;
                btn.onclick = () => checkAnswer(option, btn);
                answerOptions.appendChild(btn);
            });
        } else if (question.type === "true_false") {
            ["Đúng", "Sai"].forEach(option => {
                let btn = document.createElement("button");
                btn.classList.add("answer-btn");
                btn.textContent = option;
                btn.onclick = () => checkAnswer(option, btn);
                answerOptions.appendChild(btn);
            });
        } else if (question.type === "fill_in_the_blank") {
            let input = document.createElement("input");
            input.type = "text";
            input.id = "fill-answer";
            input.placeholder = "Nhập câu trả lời...";
            answerOptions.appendChild(input);

            let submitBtn = document.createElement("button");
            submitBtn.textContent = "Kiểm tra";
            submitBtn.onclick = () => checkAnswer(input.value.trim(), submitBtn);
            answerOptions.appendChild(submitBtn);
        }
    }

    function checkAnswer(selectedAnswer, btn) {
        if (answered) return; // Ngăn trả lời nhiều lần
        answered = true; // Đánh dấu đã trả lời

        let correctAnswer = questions[currentQuestionIndex].correct_answer;
        const answerOptions = document.getElementById("answer-options");
        const nextButton = document.getElementById("next-btn");

        let resultMessage = document.createElement("p");
        resultMessage.classList.add("result-message");

        if (selectedAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
            score++;
            resultMessage.textContent = "✅ Đúng!";
            resultMessage.classList.add("correct");
            btn.classList.add("btn-correct"); // Thêm class để đổi màu nút đúng
        } else {
            resultMessage.textContent = `❌ Sai! Đáp án đúng: ${correctAnswer}`;
            resultMessage.classList.add("incorrect");
            btn.classList.add("btn-incorrect"); // Thêm class để đổi màu nút sai
        }

        answerOptions.appendChild(resultMessage);
        nextButton.style.display = "block"; // Hiện nút tiếp tục
    }

    document.getElementById("next-btn").addEventListener("click", function () {
        currentQuestionIndex++;
        showQuestion();
    });

    loadQuestions();
});
