/**
 * Forgot Password Handler - Đơn giản
 * Flow: Nhập SĐT → OTP + Mật khẩu mới → Thành công
 */

/**
 * Initialize forgot password functionality
 */
function initializeForgotPassword() {
    console.log("Initializing forgot password functionality...");

    // Ensure DOM elements are available
    setTimeout(() => {
        bindForgotPasswordEvents();
        bindOtpEvents();
    }, 300);
}

/**
 * Bind events for forgot password
 */
function bindForgotPasswordEvents() {
    // Bind forgot password link
    const forgotPasswordLink = document.querySelector('a[onclick="showForgotPasswordForm()"]');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function (e) {
            e.preventDefault();
            showForgotPasswordForm();
        });
        console.log("Forgot password link bound");
    }

    // Bind back to login links
    const backToLoginLinks = document.querySelectorAll('a[onclick="showLoginForm()"]');
    backToLoginLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            showLoginForm();
        });
    });

    // Bind form submissions
    const forgotForm = document.querySelector('.forgot-password-form');
    const resetForm = document.querySelector('.reset-password-form');

    if (forgotForm) {
        forgotForm.addEventListener('submit', function (e) {
            e.preventDefault();
            sendForgotPasswordOTP();
        });
    }

    if (resetForm) {
        resetForm.addEventListener('submit', function (e) {
            e.preventDefault();
            resetPassword();
        });
    }

    bindPhoneInputValidation();

    console.log("Forgot password events bound");
}

/**
 * Bind OTP input events
 */
function bindOtpEvents() {
    const otpInputs = document.querySelectorAll('.otp-box');

    otpInputs.forEach((input, index) => {
        // Remove existing event listeners to prevent duplicates
        input.removeEventListener('input', input._otpInputHandler);
        input.removeEventListener('keydown', input._otpKeyHandler);
        input.removeEventListener('paste', input._otpPasteHandler);

        // Input handler
        input._otpInputHandler = (e) => moveOtpNext(e.target, index);
        input.addEventListener('input', input._otpInputHandler);

        // Keydown handler
        input._otpKeyHandler = (e) => {
            if (e.key === 'Backspace' && input.value === '' && index > 0) {
                const prevInput = otpInputs[index - 1];
                prevInput.focus();
                prevInput.classList.remove('filled');
            }

            if (e.key === 'Enter') {
                verifyOTP();
            }
        };
        input.addEventListener('keydown', input._otpKeyHandler);

        // Paste handler
        input._otpPasteHandler = (e) => {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            if (paste.match(/^\d{4}$/)) {
                for (let i = 0; i < 4; i++) {
                    if (otpInputs[i]) {
                        otpInputs[i].value = paste[i];
                        otpInputs[i].classList.add('filled');
                    }
                }
                setTimeout(() => verifyOTP(), 500);
            }
        };
        input.addEventListener('paste', input._otpPasteHandler);
    });

    console.log("OTP events bound");
}

// Make functions globally accessible
window.showForgotPasswordForm = showForgotPasswordForm;
window.showLoginForm = showLoginForm;
window.sendForgotPasswordOTP = sendForgotPasswordOTP;
window.resetPassword = resetPassword;
window.resendOTP = resendOTP;
window.moveOtpNext = moveOtpNext;
window.togglePassword = togglePassword;
window.backToLogin = backToLogin;
window.initializeForgotPassword = initializeForgotPassword;


let otpTimer = null;
let timeLeft = 180; // 3 phút
let currentPhone = null;
let correctOtp = null;

/**
 * Hiển thị form quên mật khẩu
 */
function showForgotPasswordForm() {
    hideAllForms();
    document.querySelector('.forgot-password-form').classList.add('active');

    // Clear và focus
    const phoneInput = document.getElementById('forgotPhoneInput');
    phoneInput.value = '';
    phoneInput.focus();
    hideError('forgotPhoneError');
}

/**
 * Hiển thị form đăng nhập
 */
function showLoginForm() {
    hideAllForms();
    document.querySelector('.login-form').classList.add('active');
    document.querySelector('.login-btn').classList.add('active');
    document.querySelector('.register-btn').classList.remove('active');
}

/**
 * Ẩn tất cả forms
 */
function hideAllForms() {
    const forms = document.querySelectorAll('.account-form form');
    forms.forEach(form => form.classList.remove('active'));

    const buttons = document.querySelectorAll('.account-form .buttons .btn');
    buttons.forEach(btn => btn.classList.remove('active'));
}

/**
 * Gửi OTP quên mật khẩu
 */
async function sendForgotPasswordOTP() {
    const phoneInput = document.getElementById('forgotPhoneInput');
    const phone = phoneInput.value.trim();

    if (!validatePhone(phone)) {
        showError('forgotPhoneError', 'Số điện thoại không hợp lệ! Vui lòng nhập 10 chữ số.');
        return;
    }

    try {
        const button = document.querySelector('.forgot-password-form .btn');
        showLoading(button, 'Đang gửi...');

        // Giả lập API call
        await simulateAPI(1500);

        // Giả lập kiểm tra SĐT (demo: 1234567890 là lỗi)
        if (phone === '1234567890') {
            throw new Error('Phone not registered');
        }

        // Thành công - chuyển đến form reset
        currentPhone = phone;
        correctOtp = '1234'; // Demo OTP
        console.log(`Demo OTP: ${correctOtp}`);

        showResetPasswordForm();
        startOtpTimer();

    } catch (error) {
        showError('forgotPhoneError', 'Số điện thoại chưa được đăng ký!');
    } finally {
        hideLoading(button, '<i class="fas fa-paper-plane"></i> Gửi mã OTP');
    }
}

/**
 * Hiển thị form reset password
 */
function showResetPasswordForm() {
    hideAllForms();
    document.querySelector('.reset-password-form').classList.add('active');

    // Hiển thị số điện thoại
    const phoneDisplay = document.getElementById('resetPhoneDisplay');
    phoneDisplay.textContent = currentPhone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');

    // Reset form về trạng thái ban đầu
    resetResetPasswordForm();

    setTimeout(() => {
        document.querySelector('.otp-box').focus();
    }, 100);
}

/**
 * Di chuyển focus giữa các ô OTP
 */
function moveOtpNext(current, index) {
    // Chỉ cho phép nhập số
    if (current.value && !/^\d$/.test(current.value)) {
        current.value = '';
        return;
    }

    if (current.value.length === 1) {
        current.classList.add('filled');
        if (index < 3) {
            document.querySelectorAll('.otp-box')[index + 1].focus();
        }
    } else {
        current.classList.remove('filled');
    }

    // Auto verify khi đủ 4 số
    const otpInputs = document.querySelectorAll('.otp-box');
    const allFilled = Array.from(otpInputs).every(input => input.value.length === 1);
    if (allFilled) {
        verifyOTP();
    }

    hideMessages();
}

/**
 * Xác thực OTP
 */
function verifyOTP() {
    const otpInputs = document.querySelectorAll('.otp-box');
    const enteredOtp = Array.from(otpInputs).map(input => input.value).join('');

    if (enteredOtp.length !== 4) {
        showError('resetPasswordError', 'Vui lòng nhập đầy đủ 4 số!');
        return;
    }

    if (enteredOtp === correctOtp || enteredOtp === '1234') {
        showSuccess('resetPasswordSuccess', 'OTP chính xác!');

        // THAY ĐỔI: Ẩn phần OTP và hiện phần đặt mật khẩu
        hideOtpSection();
        showPasswordSection();

    } else {
        showError('resetPasswordError', 'Mã OTP không chính xác!');
        clearOtpInputs();
        addErrorEffect();
    }
}


/**
 * Đặt lại mật khẩu
 */
/**
 * Đặt lại mật khẩu
 */
async function resetPassword() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate mật khẩu
    if (!isPasswordValid(newPassword)) {
        showError('passwordError', 'Mật khẩu chưa đáp ứng yêu cầu!');
        return;
    }

    if (newPassword !== confirmPassword) {
        showError('passwordError', 'Mật khẩu xác nhận không khớp!');
        return;
    }

    try {
        const button = document.querySelector('.password-section .btn-primary');
        showLoading(button, 'Đang cập nhật...');

        // Giả lập API call
        await simulateAPI(2000);

        clearOtpTimer();

        // CHÍNH XÁC: Chỉ hiện modal sau khi hoàn thành
        showSuccessModal();

    } catch (error) {
        showError('passwordError', 'Có lỗi xảy ra khi đổi mật khẩu!');
    } finally {
        const button = document.querySelector('.password-section .btn-primary');
        hideLoading(button, '<i class="fas fa-save"></i> Đổi mật khẩu');
    }
}

/**
 * Gửi lại OTP - KHÔNG CẦN KIỂM TRA THỜI GIAN
 */
async function resendOTP() {
    if (!currentPhone) {
        alert('Không tìm thấy số điện thoại!');
        return;
    }

    try {
        const button = document.getElementById('resendBtn');
        showLoading(button, 'Đang gửi...');

        // Giả lập API call
        await simulateAPI(1500);

        // Tạo OTP mới
        correctOtp = '1234';
        console.log(`Demo OTP mới: ${correctOtp}`);

        // Clear form và restart timer
        clearOtpInputs();
        hideMessages();
        startOtpTimer(); // Restart timer từ đầu

        // Hiển thị thông báo thành công
        showSuccess('resetPasswordSuccess', 'Đã gửi lại mã OTP thành công!');

        // Ẩn thông báo sau 3 giây
        setTimeout(() => {
            hideMessages();
        }, 3000);

    } catch (error) {
        showError('resetPasswordError', 'Có lỗi xảy ra khi gửi lại OTP!');
    } finally {
        const button = document.getElementById('resendBtn');
        hideLoading(button, '<i class="fas fa-redo"></i> Gửi lại mã OTP');
    }
}

/**
 * Bắt đầu đếm ngược OTP - LUÔN CHO PHÉP GỬI LẠI
 */
function startOtpTimer() {
    timeLeft = 180; // 3 phút
    const resendBtn = document.getElementById('resendBtn');

    // THAY ĐỔI: LUÔN ENABLE nút gửi lại
    if (resendBtn) {
        resendBtn.disabled = false;
        resendBtn.style.opacity = '1';
    }

    // Clear timer cũ nếu có
    if (otpTimer) {
        clearInterval(otpTimer);
    }

    otpTimer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearOtpTimer();
            // Vẫn giữ enable
            if (resendBtn) {
                resendBtn.disabled = false;
                resendBtn.style.opacity = '1';
            }
        }
    }, 1000);

    console.log("OTP timer started, resend button ALWAYS enabled");
}

/**
 * Cập nhật hiển thị timer
 */
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const countdownElement = document.getElementById('countdown');

    countdownElement.textContent =
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const timerElement = document.getElementById('otpTimer');
    if (timeLeft <= 30) {
        timerElement.classList.add('expired');
    } else {
        timerElement.classList.remove('expired');
    }
}

/**
 * Xóa timer
 */
function clearOtpTimer() {
    if (otpTimer) {
        clearInterval(otpTimer);
        otpTimer = null;
    }
}

/**
 * Toggle password visibility
 */
function togglePassword(inputId, toggleElement) {
    const input = document.getElementById(inputId);
    const icon = toggleElement.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

/**
 * Bind password validation
 */
/**
 * Bind phone input validation
 */
function bindPhoneInputValidation() {
    const phoneInput = document.getElementById('forgotPhoneInput');

    if (phoneInput) {
        // Chỉ cho phép nhập số và giới hạn 10 ký tự
        phoneInput.addEventListener('input', function (e) {
            // Loại bỏ tất cả ký tự không phải số
            let value = e.target.value.replace(/[^0-9]/g, '');

            // Giới hạn tối đa 10 số
            if (value.length > 10) {
                value = value.slice(0, 10);
            }

            e.target.value = value;

            // Ẩn lỗi khi user bắt đầu nhập
            if (value.length > 0) {
                hideError('forgotPhoneError');
            }
        });

        // Ngăn paste nội dung không phải số
        phoneInput.addEventListener('paste', function (e) {
            e.preventDefault();
            let paste = (e.clipboardData || window.clipboardData).getData('text');
            paste = paste.replace(/[^0-9]/g, '').slice(0, 10);
            e.target.value = paste;
        });

        // Ngăn nhập ký tự đặc biệt
        phoneInput.addEventListener('keypress', function (e) {
            // Chỉ cho phép số (0-9)
            if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                e.preventDefault();
            }
        });
    }
}

/**
 * Validate password requirements
 */
function validatePasswordRequirements(password) {
    const lengthCheck = document.getElementById('length-check');
    const uppercaseCheck = document.getElementById('uppercase-check');
    const numberCheck = document.getElementById('number-check');

    // Length check
    if (password.length >= 8) {
        lengthCheck.classList.add('valid');
        lengthCheck.innerHTML = '<i class="fas fa-check"></i> Ít nhất 8 ký tự';
    } else {
        lengthCheck.classList.remove('valid');
        lengthCheck.innerHTML = '<i class="fas fa-times"></i> Ít nhất 8 ký tự';
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
        uppercaseCheck.classList.add('valid');
        uppercaseCheck.innerHTML = '<i class="fas fa-check"></i> Ít nhất 1 chữ hoa';
    } else {
        uppercaseCheck.classList.remove('valid');
        uppercaseCheck.innerHTML = '<i class="fas fa-times"></i> Ít nhất 1 chữ hoa';
    }

    // Number check
    if (/[0-9]/.test(password)) {
        numberCheck.classList.add('valid');
        numberCheck.innerHTML = '<i class="fas fa-check"></i> Ít nhất 1 số';
    } else {
        numberCheck.classList.remove('valid');
        numberCheck.innerHTML = '<i class="fas fa-times"></i> Ít nhất 1 số';
    }
}

/**
 * Kiểm tra mật khẩu hợp lệ
 */
function isPasswordValid(password) {
    return password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password);
}

/**
 * Hiển thị modal thành công
 */
function showSuccessModal() {
    document.getElementById('successModal').classList.add('active');
}

/**
 * Quay về đăng nhập
 */
function backToLogin() {
    document.getElementById('successModal').classList.remove('active');
    document.querySelector('.account-form').classList.remove('active');

    // Reset tất cả
    currentPhone = null;
    correctOtp = null;
    clearOtpTimer();
    clearOtpInputs();
    clearPasswordInputs();
    resetPasswordRequirements();
    hideMessages();

    setTimeout(() => {
        showLoginForm();
    }, 300);
}

/**
 * Utility functions
 */
function validatePhone(phone) {
    return /^[0-9]{10}$/.test(phone);
}

function simulateAPI(delay = 1000) {
    return new Promise(resolve => setTimeout(resolve, delay));
}

function clearOtpInputs() {
    const otpInputs = document.querySelectorAll('.otp-box');
    otpInputs.forEach(input => {
        input.value = '';
        input.classList.remove('filled', 'error');
    });
}

function clearPasswordInputs() {
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

function resetPasswordRequirements() {
    const checks = ['length-check', 'uppercase-check', 'number-check'];
    const texts = ['Ít nhất 8 ký tự', 'Ít nhất 1 chữ hoa', 'Ít nhất 1 số'];

    checks.forEach((id, index) => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.remove('valid');
            element.innerHTML = `<i class="fas fa-times"></i> ${texts[index]}`;
        }
    });
}

function showLoading(button, text) {
    if (button) {
        button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
        button.disabled = true;
    }
}

function hideLoading(button, originalText) {
    if (button) {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.querySelector('span').textContent = message;
        errorElement.style.display = 'flex';
        errorElement.classList.add('show');
    }
}

function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.style.display = 'none';
        errorElement.classList.remove('show');
    }
}

function showSuccess(elementId, message) {
    const successElement = document.getElementById(elementId);
    if (successElement) {
        successElement.querySelector('span').textContent = message;
        successElement.style.display = 'flex';
        successElement.classList.add('show');
    }
}

function hideMessages() {
    hideError('resetPasswordError');
    const successElement = document.getElementById('resetPasswordSuccess');
    if (successElement) {
        successElement.classList.remove('show');
    }
}

function addErrorEffect() {
    const otpInputs = document.querySelectorAll('.otp-box');
    otpInputs.forEach(input => input.classList.add('error'));
    setTimeout(() => {
        otpInputs.forEach(input => input.classList.remove('error'));
    }, 500);
}

// Event listeners cho OTP inputs
document.addEventListener('DOMContentLoaded', function () {
    const otpInputs = document.querySelectorAll('.otp-box');
    otpInputs.forEach((input, index) => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && input.value === '' && index > 0) {
                const prevInput = otpInputs[index - 1];
                prevInput.focus();
                prevInput.classList.remove('filled');
            }

            if (e.key === 'Enter') {
                verifyOTP();
            }
        });

        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            if (paste.match(/^\d{4}$/)) {
                for (let i = 0; i < 4; i++) {
                    if (otpInputs[i]) {
                        otpInputs[i].value = paste[i];
                        otpInputs[i].classList.add('filled');
                    }
                }
                setTimeout(() => verifyOTP(), 500);
            }
        });
    });
});

/**
 * Ẩn phần OTP
 */
function hideOtpSection() {
    const otpSection = document.querySelector('.otp-section');
    if (otpSection) {
        otpSection.style.display = 'none';
    }
}

/**
 * Hiện phần đặt mật khẩu
 */
function showPasswordSection() {
    const passwordSection = document.querySelector('.password-section');
    if (passwordSection) {
        passwordSection.style.display = 'block';
        // Focus vào input mật khẩu mới
        setTimeout(() => {
            document.getElementById('newPassword').focus();
            bindPasswordValidation();
        }, 100);
    }
}

/**
 * Bind password validation
 */
function bindPasswordValidation() {
    const newPasswordInput = document.getElementById('newPassword');

    if (newPasswordInput) {
        // Remove existing listener to prevent duplicates
        newPasswordInput.removeEventListener('input', newPasswordInput._passwordHandler);

        // Add new listener
        newPasswordInput._passwordHandler = () => {
            validatePasswordRequirements(newPasswordInput.value);
        };
        newPasswordInput.addEventListener('input', newPasswordInput._passwordHandler);
    }
}

/**
 * Reset form về trạng thái ban đầu
 */
function resetResetPasswordForm() {
    // Hiện lại phần OTP
    const otpSection = document.querySelector('.otp-section');
    if (otpSection) {
        otpSection.style.display = 'block';
    }

    // Ẩn phần đặt mật khẩu
    const passwordSection = document.querySelector('.password-section');
    if (passwordSection) {
        passwordSection.style.display = 'none';
    }

    // Clear inputs
    clearOtpInputs();
    clearPasswordInputs();
    resetPasswordRequirements();
    hideMessages();
}

function backToOtpSection() {
    // Ẩn phần mật khẩu
    const passwordSection = document.querySelector('.password-section');
    if (passwordSection) {
        passwordSection.style.display = 'none';
    }

    // Hiện lại phần OTP
    const otpSection = document.querySelector('.otp-section');
    if (otpSection) {
        otpSection.style.display = 'block';
    }

    // Focus về ô OTP đầu tiên
    setTimeout(() => {
        document.querySelector('.otp-box').focus();
    }, 100);

    // Clear password inputs
    clearPasswordInputs();
    resetPasswordRequirements();
    hideError('passwordError');
}

// Thêm vào window object
window.backToOtpSection = backToOtpSection;