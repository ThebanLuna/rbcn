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
// Tạo canvas và thêm vào trang web
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.width = 128;
canvas.height = 128;
canvas.style.position = "fixed";
canvas.style.top = "70%";
canvas.style.left = "100px";
canvas.style.zIndex = "999999"; // Đảm bảo luôn trên cùng
canvas.style.cursor = "grab"; // Con trỏ khi hover
canvas.style.pointerEvents = "auto"; // Cho phép bắt sự kiện chuột
const ctx = canvas.getContext("2d");

// Load sprite sheet từ URL
const spriteSheet = new Image();
spriteSheet.src = "https://sprite.shimejis.xyz/directory/digimon-patamon/spritesheet.png";
spriteSheet.crossOrigin = "anonymous"; // Thêm để tránh CORS issue

// Thông số sprite
const frameWidth = 128;
const frameHeight = 128;
const totalFrames = 36;

// Trạng thái
let currentFrame = 0;
let frameDelay = 0;
let frameDelayCount = 15; // Làm chậm animation hơn nữa
let x = 100;
let y = window.innerHeight - frameHeight - 20;
let direction = 1; // 1: đi sang phải, -1: đi sang trái
let moveDelay = 0;
let isDragging = false;
let offsetX = 0, offsetY = 0;
let currentState = "idle"; // idle, walking, sitting
let attachedElement = null;
let idleCounter = 0;
let walkingSteps = 0;
let targetElement = null;

// Xử lý kéo thả
canvas.addEventListener("mousedown", function(e) {
    e.preventDefault(); // Ngăn các hành vi mặc định
    
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    if (clickX >= 0 && clickX <= canvas.width && 
        clickY >= 0 && clickY <= canvas.height) {
        isDragging = true;
        currentState = "idle";
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        canvas.style.cursor = "grabbing";
    }
});

document.addEventListener("mousemove", function(e) {
    if (isDragging) {
        // Tính toán vị trí mới
        const newX = e.clientX - offsetX;
        const newY = e.clientY - offsetY;
        
        // Cập nhật vị trí canvas
        canvas.style.left = newX + "px";
        canvas.style.top = newY + "px";
        
        // Cập nhật vị trí x, y
        x = newX;
        y = newY;
    }
});

document.addEventListener("mouseup", function(e) {
    if (isDragging) {
        isDragging = false;
        canvas.style.cursor = "grab";
        
        // Tìm phần tử ở vị trí thả
        targetElement = document.elementFromPoint(e.clientX, e.clientY + frameHeight/2);
        
        if (targetElement && targetElement !== canvas && targetElement !== document.body && targetElement !== document.documentElement) {
            attachedElement = targetElement;
            const rect = targetElement.getBoundingClientRect();
            
            // Nếu là phần tử nhỏ, di chuyển đến phần dưới của nó
            if (rect.height < frameHeight) {
                y = rect.bottom - frameHeight;
            } else {
                // Nếu là phần tử lớn, di chuyển đến phần trên của nó
                y = rect.top;
            }
            
            x = rect.left + (rect.width / 2) - (frameWidth / 2);
            
            // Đảm bảo nhân vật không bị vượt quá màn hình
            if (x < 0) x = 0;
            if (x > window.innerWidth - frameWidth) x = window.innerWidth - frameWidth;
            
            canvas.style.left = x + "px";
            canvas.style.top = y + "px";
            
            currentState = "sitting";
            moveDelay = 100 + Math.floor(Math.random() * 200);
        } else {
            // Nếu không có phần tử, quay về trạng thái bình thường
            currentState = "idle";
            moveDelay = 50;
        }
    }
});

// Vẽ nhân vật từ sprite sheet
function drawFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Chọn frame theo trạng thái
    let startFrame, endFrame;
    
    switch (currentState) {
        case "idle":
            startFrame = 0;
            endFrame = 3;
            break;
        case "walking":
            startFrame = 6;
            endFrame = 11;
            break;
        case "sitting":
            startFrame = 24;
            endFrame = 26;
            break;
        default:
            startFrame = 0;
            endFrame = 3;
    }
    
    // Giữ currentFrame trong khoảng phù hợp với trạng thái
    if (currentFrame < startFrame || currentFrame > endFrame) {
        currentFrame = startFrame;
    }
    
    // Tính toán vị trí trong sprite sheet
    const col = currentFrame % 6;
    const row = Math.floor(currentFrame / 6);
    
    // Vẽ sprite
    ctx.save();
    if (direction === -1) {
        ctx.scale(-1, 1);
        ctx.drawImage(
            spriteSheet, 
            col * frameWidth, row * frameHeight, frameWidth, frameHeight,
            -frameWidth, 0, frameWidth, frameHeight
        );
    } else {
        ctx.drawImage(
            spriteSheet, 
            col * frameWidth, row * frameHeight, frameWidth, frameHeight,
            0, 0, frameWidth, frameHeight
        );
    }
    ctx.restore();
    
    // Làm chậm animation bằng cách đếm
    frameDelay++;
    if (frameDelay >= frameDelayCount) {
        frameDelay = 0;
        currentFrame++;
        if (currentFrame > endFrame) {
            currentFrame = startFrame;
        }
    }
}

// Cập nhật vị trí
function updatePosition() {
    if (isDragging) return;
    
    // Nếu đang bám vào phần tử, kiểm tra phần tử còn tồn tại không
    if (attachedElement) {
        if (!document.body.contains(attachedElement)) {
            attachedElement = null;
            currentState = "idle";
        } else {
            // Thỉnh thoảng rời khỏi phần tử
            idleCounter++;
            if (idleCounter > 300) { // ~ 5 giây
                idleCounter = 0;
                if (Math.random() < 0.3) {
                    attachedElement = null;
                    currentState = "idle";
                    moveDelay = 30;
                }
            }
            return;
        }
    }
    
    // Chỉ di chuyển khi đã đến thời điểm
    moveDelay--;
    if (moveDelay <= 0) {
        // Tạo hành động ngẫu nhiên
        const action = Math.random();
        
        if (action < 0.6) { // 60% thời gian: đứng yên
            currentState = "idle";
            moveDelay = 100 + Math.floor(Math.random() * 150);
            walkingSteps = 0;
        } else { // 40% thời gian: di chuyển
            if (currentState !== "walking") {
                currentState = "walking";
                
                // Chọn hướng di chuyển
                if (Math.random() < 0.5) {
                    direction = direction * -1;
                }
                
                walkingSteps = 10 + Math.floor(Math.random() * 10);
            }
            
            // Di chuyển một bước
            x += direction * 1; // Di chuyển rất chậm
            
            // Kiểm tra giới hạn màn hình
            if (x > window.innerWidth - frameWidth - 10) {
                direction = -1;
                x = window.innerWidth - frameWidth - 10;
            } else if (x < 10) {
                direction = 1;
                x = 10;
            }
            
            // Cập nhật vị trí canvas
            canvas.style.left = x + "px";
            
            walkingSteps--;
            if (walkingSteps <= 0) {
                currentState = "idle";
                moveDelay = 80 + Math.floor(Math.random() * 150);
            }
        }
    }
}

// Animation loop
function animate() {
    drawFrame();
    updatePosition();
    requestAnimationFrame(animate);
}

// Xử lý thay đổi kích thước cửa sổ
window.addEventListener("resize", function() {
    if (!isDragging && !attachedElement) {
        y = window.innerHeight - frameHeight - 20;
        canvas.style.top = y + "px";
    }
});

// Khởi tạo
spriteSheet.onload = function() {
    console.log("Shimeji sprite loaded");
    // Bắt đầu với vị trí đúng
    y = window.innerHeight - frameHeight - 20;
    canvas.style.top = y + "px";
    
    // Bắt đầu animation
    moveDelay = 100;
    currentState = "idle";
    animate();
    
    // Đảm bảo hiển thị
    canvas.style.display = "block";
};

// Xử lý nếu tải ảnh lỗi
spriteSheet.onerror = function() {
    console.error("Could not load the sprite sheet. Check the URL.");
    // Hiển thị thông báo lỗi
    canvas.style.display = "block";
    ctx.fillStyle = "red";
    ctx.font = "14px Arial";
    ctx.fillText("Không thể tải sprite sheet!", 10, 50);
};
