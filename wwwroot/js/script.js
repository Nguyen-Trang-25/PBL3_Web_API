//document.addEventListener("DOMContentLoaded", function () {
//    // Lấy file header.html từ wwwroot/html/
//    fetch('/html/header.html')
//        .then(res => res.text())
//        .then(data => {
//            document.getElementById('header-container').innerHTML = data;
//            if (document.querySelector('.header .navbar')) {
//                attachEventHandlers(); // Gọi lại sau khi header được gắn vào DOM
//            }
//        })
//        .catch(error => {
//            console.error('Error loading header:', error);
//        });

//    // Lấy file reg_log.html
//    fetch('/html/reg_log.html')
//        .then(res => res.text())
//        .then(data => {
//            document.getElementById('reg-log-container').innerHTML = data;
//            if (document.querySelector('.account-form')) {
//                attachEventHandlers();
//                attachAuthHandlers();
//            }
//        })
//        .catch(error => {
//            console.error('Error loading reg_log:', error);
//        });
//});

//function attachEventHandlers() {
//    console.log("Attaching event handlers...");

//    let navbar = document.querySelector('.header .navbar');
//    let menuBtn = document.querySelector('#menu-btn');
//    let closeNavbar = document.querySelector('#close-navbar');
//    let accountForm = document.querySelector('.account-form');
//    let registerBtn = document.querySelector('.account-form .register-btn');
//    let loginBtn = document.querySelector('.account-form .login-btn');
//    let accountBtn = document.querySelector('#account-btn');
//    let closeForm = document.querySelector('#close-form');

//    if (menuBtn && navbar) {
//        menuBtn.onclick = () => navbar.classList.add('active');
//    }
//    if (closeNavbar && navbar) {
//        closeNavbar.onclick = () => navbar.classList.remove('active');
//    }

//    if (registerBtn && loginBtn && accountForm && closeForm) {
//        registerBtn.onclick = () => {
//            registerBtn.classList.add('active');
//            loginBtn.classList.remove('active');
//            document.querySelector('.account-form .login-form').classList.remove('active');
//            document.querySelector('.account-form .register-form').classList.add('active');
//        };

//        loginBtn.onclick = () => {
//            registerBtn.classList.remove('active');
//            loginBtn.classList.add('active');
//            document.querySelector('.account-form .register-form').classList.remove('active');
//            document.querySelector('.account-form .login-form').classList.add('active');
//        };

//        accountBtn.onclick = () => accountForm.classList.add('active');
//        closeForm.onclick = () => accountForm.classList.remove('active');
//    }
//}

// //loadcontent.js
//document.addEventListener("DOMContentLoaded", function () {
//    // Load header
//    fetch('header.html')
//        .then(res => res.text())
//        .then(data => {
//            document.getElementById('header-placeholder').innerHTML = data;
//            attachEventHandlers(); // Gọi lại sau khi header được gắn vào DOM
//        });

//    // Load account-form
//    fetch('account-form.html')
//        .then(res => res.text())
//        .then(data => {
//            document.getElementById('account-placeholder').innerHTML = data;
//        });
//});
function attachEventHandlers() {
    console.log("Attaching event handlers...");

    let navbar = document.querySelector('.header .navbar');
    let menuBtn = document.querySelector('#menu-btn');
    let closeNavbar = document.querySelector('#close-navbar');
    let accountForm = document.querySelector('.account-form');
    let registerBtn = document.querySelector('.account-form .register-btn');
    let loginBtn = document.querySelector('.account-form .login-btn');
    let accountBtn = document.querySelector('#account-btn');
    let closeForm = document.querySelector('#close-form');

    if (menuBtn && navbar) {
        menuBtn.onclick = () => navbar.classList.add('active');
    }
    if (closeNavbar && navbar) {
        closeNavbar.onclick = () => navbar.classList.remove('active');
    }

    if (registerBtn && loginBtn && accountForm && closeForm) {
        registerBtn.onclick = () => {
            registerBtn.classList.add('active');
            loginBtn.classList.remove('active');
            document.querySelector('.account-form .login-form').classList.remove('active');
            document.querySelector('.account-form .register-form').classList.add('active');
        };

        loginBtn.onclick = () => {
            registerBtn.classList.remove('active');
            loginBtn.classList.add('active');
            document.querySelector('.account-form .register-form').classList.remove('active');
            document.querySelector('.account-form .login-form').classList.add('active');
        };

        accountBtn.onclick = () => accountForm.classList.add('active');
        closeForm.onclick = () => accountForm.classList.remove('active');
    }
}


function attachAuthHandlers() {
    const acReg = document.querySelector('#ac_reg');
    const acLog = document.querySelector('#ac_log');

    console.log("acLog:", acLog); // để debug
    console.log("acReg:", acReg);

    if (acReg) {
        acReg.addEventListener('click', function (event) {
            console.log("click reg")
            event.preventDefault();

            const phone = document.querySelector('#register-phone').value;
            const password = document.querySelector('#register-password').value;
            const confirm_pass = document.querySelector('#confirm_pass').value;
            const roleInput = document.querySelector('input[name="role"]:checked');
            const role = roleInput ? roleInput.value : "";

            if (!phone || !password || !confirm_pass || !role) {
                alert("Vui lòng điền đầy đủ thông tin và chọn vai trò.");
                return;
            }

            fetch("http://localhost:7128/api/Auth/Register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, password, confirmPassword: confirm_pass, role })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.message === "Đăng ký thành công") {
                        alert("Đăng ký thành công! Vui lòng đăng nhập.");
                        document.querySelector('.login-btn').click();
                    } else {
                        alert("Lỗi đăng ký: " + data.message);
                    }
                })
                .catch(err => {
                    console.error("Lỗi:", err);
                    alert("Đã xảy ra lỗi khi đăng ký.");
                });
        });
    }

    if (acLog) {
        acLog.addEventListener('click', function (event) {
            
            event.preventDefault();

            console.log("click login")

            const phoneInput = document.querySelector('#login-phone');
            const passwordInput = document.querySelector('#login-password');

            if (!phoneInput || !passwordInput) {
                alert("Không tìm thấy input đăng nhập.");
                return;
            }

            const Phone = phoneInput.value.trim();
            const Password = passwordInput.value.trim();

            if (!Phone || !Password) {
                alert('Vui lòng nhập đầy đủ số điện thoại và mật khẩu.');
                return;
            }

            fetch("http://localhost:7128/api/Auth/Login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ Phone, Password }),
            })
                .then(async response => {
                    const rawText = await response.text(); // đọc body 1 lần

                    if (!response.ok) {
                        throw new Error("Lỗi đăng nhập: " + rawText);
                    }

                    let data;
                    try {
                        data = JSON.parse(rawText); // parse từ text thành JSON
                    } catch (error) {
                        throw new Error("Phản hồi không hợp lệ từ server: " + rawText);
                    }

                    console.log("Đăng nhập thành công:", data);

                    // Lưu token vào localStorage
                    if (data.token) {
                        localStorage.setItem('token', data.token);
                    } else {
                        throw new Error("Token không tồn tại trong phản hồi.");
                    }

                    loadUserRoleAndShowUI();
                })
                .catch(error => {
                    console.error("Lỗi khi gửi yêu cầu đăng nhập:", error);
                    alert(error.message); // hiển thị lỗi cho người dùng
                });
        });
    }   
}



function loadUserRoleAndShowUI() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Bạn chưa đăng nhập!');
        window.location.href = '/index.html';
        return;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        // Lấy đúng role từ claim chuẩn Microsoft
        const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

        localStorage.setItem("role", role); // lưu role vào local

        console.log("Role:", role);

        // Chuyển trang theo vai trò
        switch (role) {
            case 'admin':
                window.location.href = '/Admin/Dashboard';
                break;
            case 'tutor':
                loadContent("header_tutor.html", "header-container", attachLogoutHandlers);
                window.location.href = '/home_tutor.html';
                break;
            case 'student':
                loadContent("header_student.html", "header-container", attachLogoutHandlers);   
                window.location.href = '/home_student.html';
                break;
            default:
                alert('Vai trò không hợp lệ!');
        }
    } catch (error) {
        console.error("Lỗi giải mã token:", error);
        logout();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const btnLogoutList = document.querySelectorAll('.btn-logout');
    btnLogoutList.forEach(function (btn) {
        btn.addEventListener('click', function () {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
        });
    });
});



//function loadUserRoleAndShowUI() {
//    const token = localStorage.getItem('token');
//    if (!token) return;

//    fetch("https://localhost:7051/api/Auth/whoami", {
//        method: "GET",
//        headers: {
//            "Authorization": "Bearer " + token
//        }
//    })
//        .then(response => {
//            if (!response.ok) {
//                return response.text().then(err => {
//                    throw new Error("Token không hợp lệ: " + err);
//                });
//            }
//            return response.json();
//        })
//        .then(data => {
//            console.log("Đã đăng nhập:", data);

//            const role = data.message.includes('Admin') ? 'Admin' :
//                data.message.includes('Tutor') ? 'Tutor' :
//                    data.message.includes('Student') ? 'Student' : '';

//            console.log("Đăng nhập với role:", role);

//            // Điều hướng theo role

//        })
//        .catch(error => {
//            console.error('Token không hợp lệ:', error.message);
//        });
//}

// Tạo request mới
//import { attachCreateRequestHandler } from "./request.js";

//document.addEventListener("DOMContentLoaded", function () {
//    const form = document.getElementById("request-form");

//    form.addEventListener("submit", async function (e) {
//        e.preventDefault();

//        const requestData = {
//            studentId: localStorage.getItem("studentId"), // Hoặc lấy từ user info
//            subjectId: form.subject.value,
//            level: form.grade.value, // Cập nhật theo đúng trường "grade"
//            fee: form.fee.value,
//            schedule: form.schedule ? form.schedule.value : "", // Nếu có thêm trường schedule
//            location: form.location.value,
//            genderTutor: form.gender.value,
//            requirement: form.requirements.value, // Sử dụng đúng id cho yêu cầu gia sư
//            learningFormat: form.mode.value // Tham chiếu đến trường "mode"
//        };

//        try {
//            const result = await createRequest(requestData);
//            alert(result.message);
//            form.reset();
//        } catch (err) {
//            alert("Gửi yêu cầu thất bại: " + err.message);
//        }
//    });
//});


document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("tutorForm");

    if (!form) {
        console.error("Không tìm thấy form với id tutorForm");
        return;
    }

    document.getElementById("btn-create-request").addEventListener("click", async function (e) {
        e.preventDefault();

        let genderT = form.gender.value === "true";

        const requestData = {
            requestId: "0000000001",
            studentId: "0000000001", // Cần đảm bảo đã có trong localStorage
            subjectId: "001",
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
            if (!role) {
                alert("Vui lòng đăng nhập để ứng tuyển.");
                return;
            }

            if (role === "tutor") {
                window.location.href = "apply_tutor.html";
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

