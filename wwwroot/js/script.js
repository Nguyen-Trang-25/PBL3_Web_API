

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("tutorForm");

    if (!form) {
        console.error("Không tìm thấy form với id tutorForm");
        return;
    }

    document.getElementById("btn-create-request").addEventListener("click", async function (e) {
        e.preventDefault();

        let genderT = form.gender.value === "true";
        console.log(form.subject.value)

        const requestData = {
            requestId: "0000000001",
            studentId: localStorage.getItem("studentId"),
            subjectId: form.subject.value,
            level: form.grade.value,
            fee: parseFloat(form.fee.value) || 0,
            schedule: form.schedule ? form.schedule.value : "chưa xếp",
            location: form.location.value,
            genderTutor: genderT,
            requirement: form.requirements.value,
            learningFormat: form.mode.value
        };

        console.log(requestData)

        try {
            const result = await createRequest(requestData);
            alert(result.message);

            const resultDiv = document.getElementById("postResult");
            if (resultDiv) {
                resultDiv.style.display = 'block';

                setTimeout(function () {
                    resultDiv.style.display = 'none';
                }, 3000);
            }

            form.reset();
        } catch (err) {
            alert("Gửi yêu cầu thất bại: " + err.message);
        }
    });
});

// Hàm gọi API tạo yêu cầu tìm gia sư
async function createRequest(requestData) {
    const response = await fetch('/api/request/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData?.message || 'Không thể tạo yêu cầu.';
        throw new Error(message);
    }

    return await response.json();
}

// tìm lớp học

let allCourses = [];

function renderCourseList(data) {
    const classListContainer = document.querySelector(".class-list");
    classListContainer.innerHTML = "";

    if (data.length === 0) {
        classListContainer.innerHTML = "<p>Không có lớp học nào phù hợp.</p>";
        return;
    }

    data.forEach(item => {
        const card = document.createElement("div");
        card.className = "class-card";

        card.dataset.requestId = item.requestId;

        card.innerHTML = `
            <h3>${item.subject} lớp ${item.level}</h3>
            <p><strong>Khu vực:</strong> ${item.location}</p>
            <p><strong>Hình thức:</strong> ${item.learningFormat === "online" ? "Online" : "Offline"}</p>
            <p><strong>Thời gian:</strong> ${item.schedule || "Chưa cập nhật"}</p>
            <p><strong>Học phí:</strong> ${Number(item.fee).toLocaleString("vi-VN")}đ/tháng</p>
            <button class="apply-btn">Đăng ký</button>
        `;

        card.querySelector(".apply-btn").addEventListener("click", () => {
            const role = localStorage.getItem("role");

            const requestId = card.dataset.requestId;

            if (!role) {
                alert("Vui lòng đăng nhập để ứng tuyển.");
                return;
            }

            if (role === "tutor") {
                window.location.href = `apply_tutor.html?requestId=${requestId}`;
            } else {
                alert("Chỉ gia sư mới có thể ứng tuyển lớp học.");
            }
        });

        classListContainer.appendChild(card);
    });
}

function filterCourses() {
    const subject = document.querySelector('input[name="subject"]').value.trim().toLowerCase();
    const location = document.querySelector('select[name="area"]').value.toLowerCase();
    const level = document.querySelector('select[name="grade"]').value.toLowerCase();
    const learningFormat = document.querySelector('select[name="method"]').value.toLowerCase();
    const gender = document.querySelector('select[name="tutor_gender"]').value;

    let genderTutor = null;
    if (gender === "nam") genderTutor = true;
    else if (gender === "nu") genderTutor = false;

    const filtered = allCourses.filter(item => {
        if (subject && !item.subject.toLowerCase().includes(subject)) return false;
        if (location && !item.location.toLowerCase().includes(location)) return false;
        if (level && item.level.toLowerCase() !== level) return false;
        if (learningFormat && item.learningFormat.toLowerCase() !== learningFormat) return false;
        if (genderTutor !== null && item.genderTutor !== genderTutor) return false;
        return true;
    });

    renderCourseList(filtered);
}

async function loadAllCourses() {
    const classListContainer = document.querySelector(".class-list");

    try {
        const res = await fetch("http://localhost:7128/api/request/search");
        const data = await res.json();
        allCourses = data;
        console.log(data)
        renderCourseList(allCourses);
    } catch (error) {
        console.error("Lỗi khi tải toàn bộ lớp học:", error);
        classListContainer.innerHTML = "<p>Đã xảy ra lỗi khi tải dữ liệu.</p>";
    }
}

if (window.location.pathname.endsWith("course.html")) {
    document.addEventListener("DOMContentLoaded", () => {
        loadAllCourses();

        document.getElementById("search-course").addEventListener("click", function (e) {
            e.preventDefault();
            filterCourses();
        });

    });
}

// Hàm lấy param từ URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Apply tutor
if (window.location.pathname.endsWith("apply_tutor.html")) {
    document.querySelector("#applyForm button").addEventListener("click", async () => {
      // Lấy giá trị từ form
        const fullName = document.getElementById("fullname").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const specialization = document.getElementById("major").value.trim();
        const qualification = document.getElementById("cer").value.trim();
        const experience = document.getElementById("experience").value.trim();
        const teachingArea = document.getElementById("location").value.trim();
        const requestId = getQueryParam("requestId");
        console.log(requestId)

        // Mapping giá trị select sang đúng format mong muốn
        const modeSelect = document.getElementById("mode").value;
        let teachingFormat;
        if(modeSelect === "online") teachingFormat = "Online";
        else if(modeSelect === "offline") teachingFormat = "Offline";
        else teachingFormat = "Cả hai";

        const genderSelect = document.getElementById("gender").value;
        // Ví dụ server bạn nhận gender kiểu boolean (true = nam, false = nữ), giả sử "other" là false
        let gender;
        if(genderSelect === "male") gender = true;
        else gender = false;

            // Tạo object dữ liệu gửi lên
        const data = {
            RequestId: requestId,
            TutorId: localStorage.getItem("tutorId"),
            FullName: fullName,
            Email: email,
            Phone: phone,
            Specialization: specialization,
            Qualification: qualification,
            Experience: experience,
            TeachingArea: teachingArea,
            TeachingFormat: teachingFormat,
            Gender: gender
      };

            try {
        const response = await fetch("http://localhost:7128/api/application/apply", {
                method: "POST",
            headers: {
                "Content-Type": "application/json"
          },
            body: JSON.stringify(data)
        });

            if (!response.ok) {
          const errorData = await response.json();
            alert("Lỗi khi gửi hồ sơ: " + (errorData.message || response.statusText));
            return;
        }

            const result = await response.json();
                alert(result.message || "Ứng tuyển thành công!");

                window.location.href = "home_tutor.html";

      } catch (error) {
                alert("Có lỗi xảy ra khi gửi dữ liệu: " + error.message);
      }
    });
}

// Xem lịch sử lớp học
if (window.location.pathname.endsWith("class_history.html")) {
    document.addEventListener('DOMContentLoaded', () => {
        const token = localStorage.getItem('token');

        if (!token) {
            document.getElementById('class-history-list').innerHTML = '<p>Vui lòng đăng nhập để xem lịch sử lớp học.</p>';
            return;
        }

        fetch('/api/request/historyRequest', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Lỗi khi tải dữ liệu lớp học');
                }
                return response.json();
            })
            .then(data => {
                const container = document.getElementById('class-history-list');
                container.innerHTML = '';

                console.log(data);

                if (!Array.isArray(data) || data.length === 0) {
                    container.innerHTML = '<p>Chưa có lớp học nào.</p>';
                    return;
                }

                data.forEach(cls => {
                    const statusClass = cls.status === 'success' ? 'success'
                        : cls.status === 'pending' ? 'pending'
                            : 'waiting';

                    const statusText = cls.status === 'Applied'
                        ? '✅ Đã có gia sư ứng tuyển'
                        : cls.status === 'Pending'
                            ? '⏳ Đang xét duyệt'
                            : cls.status === 'Closed'
                                ? '❌ Đã hủy'
                                : '❌ Chưa có ứng viên';


                    const card = document.createElement('div');
                    card.className = 'class-card';
                    card.innerHTML = `
                    <h3>${cls.subjectName}</h3>
                    <p><strong>Khu vực:</strong> ${cls.location}</p>
                    <p><strong>Học phí:</strong> ${cls.fee} VND/tháng</p>
                    <p><strong>Trạng thái:</strong> <span class="status ${statusClass}">${statusText}</span></p>
                `;
                    container.appendChild(card);
                });
            })
            .catch(error => {
                console.error('Lỗi khi tải dữ liệu lớp học:', error);
                document.getElementById('class-history-list').innerHTML = '<p>Không thể tải dữ liệu lớp học.</p>';
            });
    });
}


//Chat
if (window.location.pathname.endsWith("chat.html")) {
    const userId = localStorage.getItem('userId'); // id người dùng hiện tại
    let currentChatPartnerId = null;

    const conversationList = document.getElementById('conversationList');
    const chatHeaderName = document.getElementById('chatHeaderName');
    const chatMessages = document.getElementById('chatMessages');
    const sendBtn = document.getElementById('sendBtn');
    const messageInput = document.getElementById('messageInput');

    

    // Hàm load danh sách người đã chat
    function loadConversations() {
        fetch(`/api/message/conversations/${userId}`)
            .then(res => res.json())
            .then(users => {
                conversationList.innerHTML = '';

                if (users.length === 0) {
                    // Nếu chưa có ai để chat, tạo 1 conversation với chính mình
                    const li = document.createElement('li');
                    li.classList.add('conversation-item', 'active');
                    li.innerHTML = `
          <img src="images/avatar/student_boy.png" class="avatar" />
          <div class="conversation-preview">
            <span class="name">Bạn</span>
            <span class="last-message">Hãy bắt đầu nhắn tin với chính mình!</span>
          </div>
        `;
                    li.addEventListener('click', () => {
                        currentChatPartnerId = userId; // chat với chính mình
                        chatHeaderName.textContent = "Bạn";
                        loadMessageHistory();
                        highlightActiveConversation(li);
                    });
                    conversationList.appendChild(li);

                    // Mặc định chọn luôn cuộc trò chuyện này
                    currentChatPartnerId = userId;
                    chatHeaderName.textContent = "Bạn";
                    loadMessageHistory();
                    highlightActiveConversation(li);
                } else {
                    // Load danh sách user bình thường
                    users.forEach(user => {
                        const li = document.createElement('li');
                        li.classList.add('conversation-item');
                        li.innerHTML = `
            <img src="${user.AvatarUrl || 'images/student_boy.png'}" class="avatar" />
            <div class="conversation-preview">
              <span class="name">${user.FullName}</span>
              <span class="last-message">${user.LastMessage || ''}</span>
            </div>
          `;
                        li.addEventListener('click', () => {
                            currentChatPartnerId = user.UserId;
                            chatHeaderName.textContent = user.FullName;
                            loadMessageHistory();
                            highlightActiveConversation(li);
                        });
                        conversationList.appendChild(li);
                    });
                }
            })
            .catch(err => console.error(err));
    }


    // Tô màu item đang chọn
    function highlightActiveConversation(activeLi) {
        document.querySelectorAll('.conversation-item').forEach(li => {
            li.classList.remove('active');
        });
        activeLi.classList.add('active');
    }

    // Load lịch sử tin nhắn giữa user và người đang chat
    function loadMessageHistory() {
        if (!currentChatPartnerId) return;
        fetch(`/api/message/history/${userId}/${currentChatPartnerId}`)
            .then(res => res.json())
            .then(messages => {
                chatMessages.innerHTML = '';
                messages.forEach(msg => {
                    const div = document.createElement('div');
                    div.classList.add('message-box');
                    if (msg.SenderId === userId) {
                        div.classList.add('sender');
                        div.innerHTML = `
            <img src="images/avatar/student_boy.png" class="avatar" alt="Student" />
            <div class="message">${msg.Content}</div>
          `;
                    } else {
                        div.classList.add('receiver');
                        div.innerHTML = `
            <img src="images/avatar/tutor_m.png" class="avatar" alt="Tutor" />
            <div class="message">${msg.Content}</div>
          `;
                    }
                    chatMessages.appendChild(div);
                });
                chatMessages.scrollTop = chatMessages.scrollHeight;
            })
            .catch(console.error);
    }

    // Gửi tin nhắn mới
    sendBtn.addEventListener('click', () => {
        const text = messageInput.value.trim();
        if (!text) return;
        if (!currentChatPartnerId) return alert("Vui lòng chọn người để chat!");

        const messageData = {
            SenderId: userId,
            ReceiverId: currentChatPartnerId,
            Content: text
        };

        console.log("Đang gửi tin nhắn:", {
            SenderId: userId,
            ReceiverId: currentChatPartnerId,
            Content: text
        });

        // Hiển thị tin nhắn mới
        const userMsg = document.createElement("div");
        userMsg.classList.add("message-box", "sender");
        userMsg.innerHTML = `
    <img src="images/avatar/student_boy.png" class="avatar" alt="Student" />
    <div class="message">${text}</div>
  `;
        chatMessages.appendChild(userMsg);
        messageInput.value = "";
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Gửi lên server
        fetch('/api/message/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageData)
        })
            .then(res => res.json())
            .then(data => console.log('Message sent:', data))
            .catch(console.error);
    });

    messageInput.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendBtn.click();
        }
    });

    // Load danh sách conversation khi trang tải xong
    document.addEventListener('DOMContentLoaded', loadConversations);

}
