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


//extension
// Thêm viewport meta cho mobile
document.head.innerHTML += '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">';

// Tạo canvas
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

// CSS cần thiết
document.body.style.margin = "0";
document.body.style.minHeight = "100vh";
document.body.style.position = "relative";

// Cấu hình canvas
canvas.width = 128;
canvas.height = 128;
canvas.style.position = "fixed";
canvas.style.left = "20px";
canvas.style.bottom = "20px";
canvas.style.zIndex = "999999";
canvas.style.cursor = "grab";
canvas.style.touchAction = "none";
canvas.style.pointerEvents = "auto";
canvas.style.display = "none"; // Ẩn cho đến khi load xong

const ctx = canvas.getContext("2d");

// Sprite và animation
const frameWidth = 128;
const frameHeight = 128;
let currentFrame = 0;
let frameDelay = 0;
const frameDelayCount = 20;
let x = 100;
let y = window.innerHeight - frameHeight - 20;
let direction = 1;
let moveDelay = 0;
let isDragging = false;
let offsetX = 0, offsetY = 0;
let currentState = "idle";
let attachedElement = null;
let idleCounter = 0;
let walkingSteps = 0;

// Xử lý kéo thả
function startDrag(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;
    
    if (clickX >= 0 && clickX <= canvas.width && clickY >= 0 && clickY <= canvas.height) {
        isDragging = true;
        currentState = "idle";
        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;
        canvas.style.cursor = "grabbing";
    }
}

function handleMove(clientX, clientY) {
    if (isDragging) {
        const newX = clientX - offsetX;
        const newY = clientY - offsetY;
        canvas.style.left = newX + "px";
        canvas.style.bottom = ""; // Reset bottom khi kéo
        canvas.style.top = newY + "px";
        x = newX;
        y = newY;
    }
}

function endDrag(clientX, clientY) {
    if (isDragging) {
        isDragging = false;
        canvas.style.cursor = "grab";
        
        const targetElement = document.elementFromPoint(clientX, clientY + frameHeight/2);
        
        if (targetElement && ![canvas, document.body, document.documentElement].includes(targetElement)) {
            attachedElement = targetElement;
            const rect = targetElement.getBoundingClientRect();
            y = rect.height < frameHeight ? rect.bottom - frameHeight : rect.top;
            x = Math.max(0, Math.min(rect.left + (rect.width/2 - frameWidth/2), window.innerWidth - frameWidth));
            
            canvas.style.left = x + "px";
            canvas.style.top = y + "px";
            currentState = "sitting";
            moveDelay = 300 + Math.random() * 400;
        } else {
            currentState = "idle";
            moveDelay = 100;
        }
    }
}

// Event listeners
canvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
});

canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startDrag(e.touches[0].clientX, e.touches[0].clientY);
});

document.addEventListener("mousemove", (e) => handleMove(e.clientX, e.clientY));
document.addEventListener("touchmove", (e) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

document.addEventListener("mouseup", (e) => endDrag(e.clientX, e.clientY));
document.addEventListener("touchend", (e) => {
    if (e.changedTouches[0]) endDrag(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
});

// Animation
function drawFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let [startFrame, endFrame] = {
        idle: [0, 3],
        walking: [6, 11],
        sitting: [24, 26]
    }[currentState] || [0, 3];

    currentFrame = currentFrame < startFrame || currentFrame > endFrame ? startFrame : currentFrame;
    
    const col = currentFrame % 6;
    const row = Math.floor(currentFrame / 6);
    
    ctx.save();
    if (direction === -1) {
        ctx.scale(-1, 1);
        ctx.drawImage(spriteSheet, col*frameWidth, row*frameHeight, frameWidth, frameHeight, -frameWidth, 0, frameWidth, frameHeight);
    } else {
        ctx.drawImage(spriteSheet, col*frameWidth, row*frameHeight, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
    }
    ctx.restore();
    
    if (++frameDelay >= frameDelayCount) {
        frameDelay = 0;
        currentFrame = currentFrame >= endFrame ? startFrame : currentFrame + 1;
    }
}

function updatePosition() {
    if (isDragging) return;
    
    if (attachedElement && !document.body.contains(attachedElement)) {
        attachedElement = null;
        currentState = "idle";
    }
    
    if (--moveDelay <= 0) {
        if (Math.random() < 0.8) {
            currentState = "idle";
            moveDelay = 200 + Math.random() * 300;
            walkingSteps = 0;
        } else {
            currentState = "walking";
            direction = Math.random() < 0.5 ? -direction : direction;
            walkingSteps = 5 + Math.random() * 5;
        }
    }
    
    if (currentState === "walking" && walkingSteps-- > 0) {
        x += direction * 2;
        x = Math.max(10, Math.min(x, window.innerWidth - frameWidth - 10));
        canvas.style.left = x + "px";
    }
}

function animate() {
    drawFrame();
    updatePosition();
    requestAnimationFrame(animate);
}

// Tải ảnh
const spriteSheet = new Image();
spriteSheet.src = "https://sprite.shimejis.xyz/directory/digimon-patamon/spritesheet.png";
spriteSheet.onload = () => {
    console.log("Tải sprite thành công!");
    canvas.style.display = "block";
    animate();
};

// Fallback
spriteSheet.onerror = () => {
    console.error("Lỗi tải sprite!");
    canvas.style.display = "block";
    ctx.fillStyle = "red";
    ctx.font = "20px Arial";
    ctx.fillText("🐾", 50, 70);
};

// Nút reset cho mobile
const resetBtn = document.createElement("button");
resetBtn.textContent = "Hiện Shimeji";
resetBtn.style.position = "fixed";
resetBtn.style.right = "10px";
resetBtn.style.bottom = "10px";
resetBtn.style.zIndex = "1000000";
resetBtn.onclick = () => {
    canvas.style.display = "block";
    canvas.style.left = "20px";
    canvas.style.bottom = "20px";
};
document.body.appendChild(resetBtn);
