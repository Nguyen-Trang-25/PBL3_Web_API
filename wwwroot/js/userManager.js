let currentUser = null;
document.addEventListener("DOMContentLoaded", () => {
    loadUserProfile();
    // Gán sự kiện nút lưu
    const saveBtn = document.getElementById("saveProfileBtn");
    if (saveBtn) {
        saveBtn.addEventListener("click", handleSaveProfile);
    }
});

async function loadUserProfile() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Vui lòng đăng nhập để xem thông tin cá nhân.");
        return;
    }

    try {
        const response = await fetch("http://localhost:7128/api/Profile/GetMyUser", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();
        currentUser = data;
        console.log(data)

        if (!response.ok) {
            alert("Lỗi: " + (data.message || "Không thể tải thông tin người dùng."));
            return;
        }

        renderUserProfile(data);
        populateEditProfileForm(data);

    } catch (err) {
        console.error("Lỗi khi lấy thông tin người dùng:", err);
        alert("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    }
}

function renderUserProfile(user) {
    if (!user) return;

    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text || "Chưa cập nhật";
    };

    // Thông tin chung
    setText("userFullName", user.fullName);
    setText("userDisplayName", user.fullName);
    setText("userAdress", user.address);
    setText("userDateofBirth", user.dateOfBirth ? formatDate(user.dateOfBirth) : "");
    setText("userPhone", user.phone);
    setText("userEmail", user.email);
    setText("userGender", user.gender === true ? "Nam" : user.gender === false ? "Nữ" : "Chưa cập nhật");

    // Xử lý thông tin riêng theo userType
    const container = document.querySelector(".right-side");
    if (!container) return;

    const roleInfo = getRoleSpecificHTML(user);
    container.insertAdjacentHTML("beforeend", roleInfo);
}

function populateEditProfileForm(user) {
    if (!user) return;

    const setValue = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value || "";
    };

    setValue("fullName", user.fullName);
    setValue("address", user.address);
    setValue("dateOfBirth", user.dateOfBirth);
    setValue("phone", user.phone);
    setValue("email", user.email);

    if (user.gender === true) setValue("gender", "Nam");
    else if (user.gender === false) setValue("gender", "Nữ");
    else setValue("gender", "");

    const roleSpecific = document.getElementById("roleSpecificFields");
    if (!roleSpecific) return;

    if (user.userType === "tutor") {
        roleSpecific.innerHTML = `
            <label for="education">Trình độ:</label>
            <input type="text" id="education" value="${user.education || ''}">

            <label for="experience">Kinh nghiệm:</label>
            <input type="text" id="experience" value="${user.experience || ''}">

            <label for="subjects">Chuyên môn:</label>
            <input type="text" id="subjects" value="${user.subjects || ''}">
        `;
    }

    if (user.userType === "student") {
        roleSpecific.innerHTML = `
            <label for="grade">Lớp:</label>
            <input type="text" id="grade" value="${user.grade || ''}">

            <label for="school">Trường:</label>
            <input type="text" id="school" value="${user.school || ''}">
        `;
    }
}

function getRoleSpecificHTML(user) {
    if (user.userType === "tutor") {
        return `
            <p><strong>Trình độ:</strong> <span>${user.education || 'Chưa cập nhật'}</span></p>
            <p><strong>Kinh nghiệm:</strong> <span>${user.experience || 'Chưa cập nhật'}</span></p>
            <p><strong>Chuyên môn:</strong> <span>${user.subjects || 'Chưa cập nhật'}</span></p>
        `;
    }

    if (user.userType === "student") {
        return `
            <p><strong>Lớp:</strong> <span>${user.grade || 'Chưa cập nhật'}</span></p>
            <p><strong>Trường:</strong> <span>${user.school || 'Chưa cập nhật'}</span></p>
        `;
    }

    return ""; // fallback nếu không xác định vai trò
}
async function handleSaveProfile() {
    const token = localStorage.getItem("token");
    console.log("Token:", token);
    if (!token) {
        alert("Vui lòng đăng nhập.");
        return;
    }
    console.log("Bắt đầu edit")
    // Lấy dữ liệu chung từ form
    const fullName = document.getElementById("fullName")?.value;
    const address = document.getElementById("address")?.value;
    const dateOfBirthRaw = document.getElementById("dateOfBirth")?.value;
    const dateOfBirth = dateOfBirthRaw ? dateOfBirthRaw : null;
    const phone = document.getElementById("phone")?.value;
    const email = document.getElementById("email")?.value;
    const genderStr = document.getElementById("gender")?.value;

    // Chuyển đổi giới tính thành boolean
    let gender = null;
    if (genderStr === "Nam") gender = true;
    else if (genderStr === "Nữ") gender = false;

    // Tạo body request
    const body = {
        fullName,
        address,
        dateOfBirth,
        phone,
        email,
        gender
    };

    // Thêm thông tin theo vai trò
    const userType = currentUser?.userType;

    if (userType === "tutor") {
        body.education = document.getElementById("education")?.value;
        body.experience = document.getElementById("experience")?.value;
        body.subjects = document.getElementById("subjects")?.value;
    } else if (userType === "student") {
        body.grade = document.getElementById("grade")?.value;
        body.school = document.getElementById("school")?.value;
    }
    console.log(body)
    try {
        const response = await fetch("http://localhost:7128/api/Profile/UpdateProfile", {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        const text = await response.text(); // Luôn đọc text
        let result;

        try {
            result = JSON.parse(text); // Nếu là JSON thì parse
        } catch (e) {
            result = { message: text }; // Nếu không phải JSON, dùng raw text
        }

        if (!response.ok) {
            alert("Lỗi: " + (result.message || "Không thể cập nhật thông tin."));
            return;
        }

        alert("Cập nhật thành công!");
        loadUserProfile();

    } catch (err) {
        console.error("Lỗi khi cập nhật hồ sơ:", err);
        alert("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    }
}
function formatDate(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date)) return "Chưa cập nhật";

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}
