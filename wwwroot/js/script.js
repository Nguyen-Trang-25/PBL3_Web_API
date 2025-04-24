// loadcontent.js
document.addEventListener("DOMContentLoaded", function () {
    // Load header
    fetch('header.html')
        .then(res => res.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
            attachEventHandlers(); // Gọi lại sau khi header được gắn vào DOM
        });

    // Load account-form
    fetch('account-form.html')
        .then(res => res.text())
        .then(data => {
            document.getElementById('account-placeholder').innerHTML = data;
        });
});

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


