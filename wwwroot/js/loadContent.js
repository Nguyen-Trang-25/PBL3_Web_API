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
    const role = localStorage.getItem("role"); // hoặc từ token/session

    console.log(role)

    if (role === "student") {
        loadContent("header_student.html", "header-container", attachLogoutHandlers);
    } else if (role === "tutor") {
        loadContent("header_tutor.html", "header-container", attachLogoutHandlers);
    } else {
        loadContent("header.html", "header-container", attachLogoutHandlers);
    }
    loadContent("footer.html", "footer-container");
    loadContent("reg_log.html", "reg-log-container", () => {
        attachEventHandlers(); // Chạy ngay sau khi reg_log được chèn vào DOM
        attachAuthHandlers();
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
            window.location.href = '/index.html'; // Điều hướng nếu cần
        });
    });
}


//function loadContent(file, elementId, callback) {
//    fetch(`html/${file}`)
//        .then(response => response.text())
//        .then(data => {
//            document.getElementById(elementId).innerHTML = data;
//            if (callback) callback(); // Chạy callback nếu có
//        })
//        .catch(error => console.error(`Lỗi khi tải ${file}:`, error));
//}

//document.addEventListener("DOMContentLoaded", function () {
//    loadContent("header.html", "header-container");
//    loadContent("footer.html", "footer-container");
//    loadContent("header_student.html", "header_student-container");
//    loadContent("header_tutor.html", "header_tutor-container");
//    loadContent("reg_log.html", "reg-log-container", () => {
//        attachEventHandlers(); // Đảm bảo chỉ gọi sau khi nội dung đã load
//    });

//    document.addEventListener("click", function (e) {
//        const userIcon = document.getElementById("user-icon");
//        const dropdown = document.getElementById("user-dropdown");
//        if (!userIcon || !dropdown) return;

//        if (userIcon.contains(e.target)) {
//            dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
//        } else if (!dropdown.contains(e.target)) {
//            dropdown.style.display = "none";
//        }
//    });
//});



