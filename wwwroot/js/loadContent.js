function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}
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
                    const rawText = await response.text();

                    if (!response.ok) {
                        throw new Error("Lỗi đăng nhập: " + rawText);
                    }

                    let data;
                    try {
                        data = JSON.parse(rawText);
                    } catch (error) {
                        throw new Error("Phản hồi không hợp lệ từ server: " + rawText);
                    }

                    if (!data.token) {
                        throw new Error("Token không tồn tại trong phản hồi.");
                    }

                    // Lưu token vào localStorage
                    localStorage.setItem('token', data.token);

                    // Giải mã token để lấy thông tin userId, studentId, tutorId
                    const decoded = parseJwt(data.token);
                    if (decoded) {
                        localStorage.setItem('userId', decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '');
                        localStorage.setItem('role', decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'] || '');
                        localStorage.setItem('studentId', decoded['studentId'] || '');
                        localStorage.setItem('tutorId', decoded['tutorId'] || '');
                    }

                    loadUserRoleAndShowUI();
                })
                .catch(error => {
                    console.error("Lỗi khi gửi yêu cầu đăng nhập:", error);
                    alert(error.message);
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
            localStorage.removeItem("userId");
            localStorage.removeItem("studentId");
            localStorage.removeItem("tutorId");
        });
    });
});

function loadContent(file, elementId, callback) {
    const targetElement = document.getElementById(elementId);
    if (!targetElement) {
        console.warn(`Không tìm thấy phần tử với id=${elementId} để load ${file}`);
        return;
    }

    fetch(`/html/${file}`)
        .then(response => response.text())
        .then(data => {
            targetElement.innerHTML = data;
            if (callback) callback();
        })
        .catch(error => console.error(`Lỗi khi tải ${file}:`, error));
}


document.addEventListener("DOMContentLoaded", function () {
    const role = localStorage.getItem("role");

    console.log(role);

    if (role === "student") {
        loadContent("header_student.html", "header-container", () => {
            attachLogoutHandlers();
            attachEventHandlers(); // Gọi sau khi header được load
        });
    } else if (role === "tutor") {
        loadContent("header_tutor.html", "header-container", () => {
            attachLogoutHandlers();
            attachEventHandlers();
        });
    } else {
        loadContent("header.html", "header-container", () => {
            attachLogoutHandlers();
            attachEventHandlers();
        });
    }

    loadContent("footer.html", "footer-container");
    loadContent("reg_log.html", "reg-log-container", () => {
        attachEventHandlers();
        attachAuthHandlers(); // Chỉ cần xử lý form đăng ký/đăng nhập
    });

    document.addEventListener("click", function (e) {
        const userIcon = document.getElementById("user-icon");
        const dropdown = document.getElementById("user-dropdown");
        if (!userIcon || !dropdown) return;

        if (userIcon.contains(e.target)) {
            dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
        } else if (!dropdown.contains(e.target)) {
            dropdown.style.display = "none";
        }
    });
});

function attachLogoutHandlers() {
    const btnLogoutList = document.querySelectorAll('.btn-logout');
    btnLogoutList.forEach(function (btn) {
        btn.addEventListener('click', function () {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("userId");
            localStorage.removeItem("studentId");
            localStorage.removeItem("tutorId");
            window.location.href = '/index.html'; // Điều hướng nếu cần
        });
    });
}

