function loadContent(file, elementId, callback) {
    fetch(`html/${file}`)
        .then(response => response.text())
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
            if (callback) callback(); // Chạy callback nếu có
        })
        .catch(error => console.error(`Lỗi khi tải ${file}:`, error));
}

document.addEventListener("DOMContentLoaded", function () {
    loadContent("header.html", "header-container");
    loadContent("footer.html", "footer-container");
    loadContent("header_student.html", "header_student-container");
    loadContent("header_tutor.html", "header_tutor-container");
    loadContent("reg_log.html", "reg-log-container", () => {
        attachEventHandlers(); // Đảm bảo chỉ gọi sau khi nội dung đã load
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

