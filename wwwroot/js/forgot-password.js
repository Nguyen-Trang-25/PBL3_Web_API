/**
 * Forgot Password Handler - SIMPLE VERSION
 * ✅ CHỈ DÙNG INLINE HANDLERS - KHÔNG COMPLEX BINDING
 * ✅ RESET PASSWORD OTP: .reset-otp class + moveResetOtpNext()
 * ✅ REGISTER OTP: .register-otp class + moveRegisterOtpNext() 
 * 
 * 
 * 
 * 
 * 
 * 
 4278 - Demo OTP
 */

let otpTimer = null;
let timeLeft = 180; // 3 phút
let currentPhone = null;
let correctOtp = null;

// ==================== BASIC INITIALIZATION ====================

/**
 * Simple initialization - NO complex binding
 */
function initializeForgotPassword() {
    console.log("🔧 Simple forgot password initialization...");

    // Just bind the forgot password link
    setTimeout(() => {
        bindForgotPasswordLinkOnly();
        console.log("✅ Simple initialization complete");
    }, 100);
}

/**
 * Only bind the forgot password link - SIMPLE
 */
function bindForgotPasswordLinkOnly() {
    const forgotLink = document.querySelector('a[onclick*="showForgotPasswordForm"]');
    if (forgotLink) {
        forgotLink.addEventListener('click', function (e) {
            e.preventDefault();
            showForgotPasswordForm();
        });
        console.log("✅ Forgot password link bound");
    }
}

// ==================== FORM DISPLAY FUNCTIONS ====================

/**
 * Show forgot password form
 */
function showForgotPasswordForm() {
    console.log("📱 Showing forgot password form...");

    hideAllForms();
    const forgotForm = document.querySelector('.forgot-password-form');
    if (forgotForm) {
        forgotForm.classList.add('active');

        const phoneInput = document.getElementById('forgotPhoneInput');
        if (phoneInput) {
            phoneInput.value = '';
            phoneInput.focus();
        }

        hideError('forgotPhoneError');
    }
}

/**
 * Show login form
 */
function showLoginForm() {
    console.log("🔐 Showing login form...");
    hideAllForms();

    const loginForm = document.querySelector('.login-form');
    const loginBtn = document.querySelector('.login-btn');
    const registerBtn = document.querySelector('.register-btn');

    if (loginForm) loginForm.classList.add('active');
    if (loginBtn) loginBtn.classList.add('active');
    if (registerBtn) registerBtn.classList.remove('active');
}

/**
 * Hide all forms
 */
function hideAllForms() {
    const forms = document.querySelectorAll('.account-form form');
    forms.forEach(form => form.classList.remove('active'));

    const buttons = document.querySelectorAll('.account-form .buttons .btn');
    buttons.forEach(btn => btn.classList.remove('active'));
}

// ==================== OTP SENDING ====================

/**
 * Send forgot password OTP
 */
async function sendForgotPasswordOTP() {

    console.log("HEhehee")

    const phoneInput = document.getElementById('forgotPhoneInput');
    const phone = phoneInput.value.trim();

    if (!validatePhone(phone)) {
        showError('forgotPhoneError', 'Số điện thoại không hợp lệ! Vui lòng nhập 10 chữ số.');
        return;
    }

    const button = document.querySelector('.forgot-password-form .btn');

    try {
        showLoading(button, 'Đang gửi...');

        const response = await fetch('/api/Verification/ForgotPassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newphone: phone })  // Gửi đúng tên thuộc tính expected by backend
        });

        const result = await response.json();

        if (!response.ok) {
            if (result.message?.includes('Không tìm thấy')) {
                showError('forgotPhoneError', 'Số điện thoại chưa được đăng ký!');
            } else {
                showError('forgotPhoneError', result.message || 'Có lỗi xảy ra khi gửi OTP!');
            }
            return;
        }



        // Thành công
        currentPhone = phone;
        console.log("✅ OTP gửi thành công:", result.message);
        startOtpTimer();
        showResetPasswordForm();

    } catch (error) {
        console.error('❌ Lỗi khi gửi OTP quên mật khẩu:', error);
        showError('forgotPhoneError', 'Lỗi kết nối máy chủ!');
    } finally {
        hideLoading(button, '<i class="fas fa-paper-plane"></i> Gửi mã OTP');
    }
}
/**
 * Show reset password form
 */
function showResetPasswordForm() {
    console.log("🔄 Showing reset password form...");

    hideAllForms();
    const resetForm = document.querySelector('.reset-password-form');
    if (resetForm) {
        resetForm.classList.add('active');
    }

    const phoneDisplay = document.getElementById('resetPhoneDisplay');
    if (phoneDisplay && currentPhone) {
        phoneDisplay.textContent = currentPhone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    }

    resetResetPasswordForm();

    setTimeout(() => {
        const firstOtpInput = document.querySelector('.reset-otp');
        if (firstOtpInput) {
            firstOtpInput.focus();
        }
    }, 100);
}

// ==================== RESET PASSWORD OTP FUNCTIONS ====================

/**
 * ✅ SIMPLE Move OTP next for RESET PASSWORD
 * CHỈ DÙNG FUNCTION NÀY - KHÔNG BIND GÌ THÊM
 */
function moveResetOtpNext(current, index) {
    console.log(`📝 RESET OTP Input ${index}: "${current.value}"`);

    // Only allow digits
    if (current.value && !/^\d$/.test(current.value)) {
        current.value = '';
        return;
    }

    // Handle filled state
    if (current.value.length === 1) {
        current.classList.add('filled');
        // Move to next input
        if (index < 3) {
            const resetOtpInputs = document.querySelectorAll('.reset-otp');
            if (resetOtpInputs[index + 1]) {
                resetOtpInputs[index + 1].focus();
            }
        }
    } else {
        current.classList.remove('filled');
    }

    // Check button state
    checkResetPasswordVerifyButton();
    hideMessages();
}

/**
 * ✅ SIMPLE Check and enable verify button for RESET PASSWORD
 */
function checkResetPasswordVerifyButton() {
    const resetOtpInputs = document.querySelectorAll('.reset-otp');
    const verifyBtn = document.getElementById('verifyOtpBtn');

    if (!verifyBtn) {
        console.error('❌ Reset verify button not found!');
        return;
    }

    const allFilled = Array.from(resetOtpInputs).every(input => {
        const isFilled = input.value.length === 1 && /^\d$/.test(input.value);
        return isFilled;
    });

    console.log(`🔍 RESET PASSWORD All filled: ${allFilled} (${resetOtpInputs.length} inputs)`);

    if (allFilled) {
        // Enable button
        verifyBtn.disabled = false;
        verifyBtn.style.opacity = '1';
        verifyBtn.style.cursor = 'pointer';
        verifyBtn.style.backgroundColor = '#0eb582';
        verifyBtn.style.borderColor = '#0eb582';
        console.log('✅ RESET PASSWORD Verify button ENABLED');
    } else {
        // Disable button
        verifyBtn.disabled = true;
        verifyBtn.style.opacity = '0.6';
        verifyBtn.style.cursor = 'not-allowed';
        verifyBtn.style.backgroundColor = '#ccc';
        verifyBtn.style.borderColor = '#ccc';
        console.log('❌ RESET PASSWORD Verify button DISABLED');
    }
}

/**
 * ✅ SIMPLE Clear reset password OTP inputs
 */
function clearResetPasswordOtpInputs() {
    const resetOtpInputs = document.querySelectorAll('.reset-otp');
    const verifyBtn = document.getElementById('verifyOtpBtn');

    resetOtpInputs.forEach(input => {
        input.value = '';
        input.classList.remove('filled', 'error');
    });

    if (verifyBtn) {
        verifyBtn.disabled = true;
        verifyBtn.style.opacity = '0.6';
        verifyBtn.style.cursor = 'not-allowed';
        verifyBtn.style.backgroundColor = '#ccc';
        verifyBtn.style.borderColor = '#ccc';
    }

    console.log("🧹 RESET PASSWORD OTP inputs cleared");
}

// ==================== REGISTER OTP FUNCTIONS ====================

/**
 * ✅ SIMPLE Move OTP next for REGISTER
 */
function moveRegisterOtpNext(current, index) {
    console.log(`📝 REGISTER OTP Input ${index}: "${current.value}"`);

    if (current.value && !/^\d$/.test(current.value)) {
        current.value = '';
        return;
    }

    if (current.value.length === 1) {
        current.classList.add('filled');
        if (index < 3) {
            const registerOtpInputs = document.querySelectorAll('.register-otp');
            if (registerOtpInputs[index + 1]) {
                registerOtpInputs[index + 1].focus();
            }
        }
    } else {
        current.classList.remove('filled');
    }

    checkRegisterVerifyButton();
}

/**
 * ✅ SIMPLE Check register verify button
 */
function checkRegisterVerifyButton() {
    const registerOtpInputs = document.querySelectorAll('.register-otp');
    const verifyBtn = document.querySelector('.register-otp-form .btn-primary');

    const allFilled = Array.from(registerOtpInputs).every(input =>
        input.value.length === 1 && /^\d$/.test(input.value)
    );

    if (verifyBtn) {
        verifyBtn.disabled = !allFilled;
    }

    console.log(`🔍 REGISTER All filled: ${allFilled}`);
}

// ==================== OTP VERIFICATION ====================

/**
 * Verify OTP for reset password
 */
async function verifyOTP() {
    console.log("Xac thuc otp")

    const resetOtpInputs = document.querySelectorAll('.reset-otp');
    const enteredOtp = Array.from(resetOtpInputs).map(input => input.value).join('');

    console.log(`📱 Entered OTP: "${enteredOtp}"`);
    console.log(`🔑 Correct OTP: "${correctOtp}"`);

    if (enteredOtp.length !== 4) {
        showError('resetPasswordError', 'Vui lòng nhập đầy đủ 4 số!');
        return;
    }

    try {
        const verifyBtn = document.querySelector('.otp-section .btn-verify');
        showLoading(verifyBtn, 'Đang xác thực...');

        const response = await fetch('/api/Verification/VerifyOtp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: currentPhone,    // biến lưu số điện thoại khi gửi OTP
                otpCode: enteredOtp,
                purpose: "Forgot Password"
            })
        });

        const result = await response.json();

        if (!response.ok) {
            showError('resetPasswordError', result.message || 'Mã OTP không chính xác hoặc đã hết hạn!');
            clearOtpInputs();
            addErrorEffect();
            return;
        }

        // OTP hợp lệ
        showSuccess('resetPasswordSuccess', 'OTP chính xác!');
        correctOtp = enteredOtp;  // Lưu lại OTP hợp lệ để dùng khi đổi pass

        hideOtpSection();
        showPasswordSection();

    } catch (error) {
        console.error('Lỗi khi xác thực OTP:', error);
        showError('resetPasswordError', 'Lỗi kết nối máy chủ!');
    } finally {
        hideLoading(verifyBtn, '<i class="fas fa-check"></i> Xác thực OTP');
    }

}

// ==================== PASSWORD RESET ====================

/**
 * Reset password
 */
async function resetPassword() {
    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

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

        const response = await fetch('/api/Verification/ChangeForgot', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: currentPhone,
                newPass: newPassword,
                confirmNew: confirmPassword
            })
        });

        const result = await response.json();

        if (!response.ok) {
            showError('passwordError', result.message || 'Có lỗi xảy ra khi đổi mật khẩu!');
            return;
        }

        clearOtpTimer();
        showSuccessModal();

    } catch (error) {
        console.error('Lỗi khi đổi mật khẩu:', error);
        showError('passwordError', 'Có lỗi xảy ra khi đổi mật khẩu!');
    } finally {
        const button = document.querySelector('.password-section .btn-primary');
        hideLoading(button, '<i class="fas fa-save"></i> Đổi mật khẩu');
    }
}

/**
 * Resend OTP
 */
async function resendOTP() {
    if (!currentPhone) {
        alert('Không tìm thấy số điện thoại!');
        return;
    }

    try {
        const button = document.getElementById('resendBtn');
        showLoading(button, 'Đang gửi...');

        const response = await fetch('/api/Verification/ForgotPassword', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newphone: currentPhone })
        });

        const result = await response.json();

        if (!response.ok) {
            showError('resetPasswordError', result.message || 'Không thể gửi lại OTP!');
            return;
        }

        // Nếu BE báo thành công:
        showSuccess('resetPasswordSuccess', 'Đã gửi lại mã OTP thành công!');
        clearResetPasswordOtpInputs();
        hideMessages();
        startOtpTimer();

    } catch (error) {
        console.error('Lỗi khi gửi lại OTP:', error);
        showError('resetPasswordError', 'Có lỗi xảy ra khi gửi lại OTP!');
    } finally {
        const button = document.getElementById('resendBtn');
        hideLoading(button, '<i class="fas fa-redo"></i> Gửi lại mã OTP');
    }
}

// ==================== TIMER FUNCTIONS ====================

function startOtpTimer() {
    timeLeft = 180;
    const resendBtn = document.getElementById('resendBtn');

    if (resendBtn) {
        resendBtn.disabled = false;
        resendBtn.style.opacity = '1';
    }

    if (otpTimer) {
        clearInterval(otpTimer);
    }

    otpTimer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearOtpTimer();
            if (resendBtn) {
                resendBtn.disabled = false;
                resendBtn.style.opacity = '1';
            }
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const countdownElement = document.getElementById('countdown');

    if (countdownElement) {
        countdownElement.textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    const timerElement = document.getElementById('otpTimer');
    if (timerElement) {
        if (timeLeft <= 30) {
            timerElement.classList.add('expired');
        } else {
            timerElement.classList.remove('expired');
        }
    }
}

function clearOtpTimer() {
    if (otpTimer) {
        clearInterval(otpTimer);
        otpTimer = null;
    }
}

// ==================== FORM SECTION FUNCTIONS ====================

function resetResetPasswordForm() {
    const otpSection = document.querySelector('.otp-section');
    if (otpSection) {
        otpSection.style.display = 'block';
    }

    const passwordSection = document.querySelector('.password-section');
    if (passwordSection) {
        passwordSection.style.display = 'none';
    }

    clearResetPasswordOtpInputs();
    clearPasswordInputs();
    resetPasswordRequirements();
    hideMessages();

    const verifyBtn = document.getElementById('verifyOtpBtn');
    if (verifyBtn) {
        verifyBtn.disabled = true;
        verifyBtn.innerHTML = '<i class="fas fa-check-circle"></i> Xác thực OTP';
        verifyBtn.style.opacity = '0.6';
        verifyBtn.style.cursor = 'not-allowed';
        verifyBtn.style.backgroundColor = '#ccc';
        verifyBtn.style.borderColor = '#ccc';
    }
}

function hideOtpSection() {
    const otpSection = document.querySelector('.otp-section');
    if (otpSection) {
        otpSection.style.display = 'none';
    }
}

function showPasswordSection() {
    const passwordSection = document.querySelector('.password-section');
    if (passwordSection) {
        passwordSection.style.display = 'block';
        setTimeout(() => {
            const newPasswordInput = document.getElementById('newPassword');
            if (newPasswordInput) {
                newPasswordInput.focus();
            }
        }, 100);
    }
}

function backToOtpSection() {
    const passwordSection = document.querySelector('.password-section');
    if (passwordSection) {
        passwordSection.style.display = 'none';
    }

    const otpSection = document.querySelector('.otp-section');
    if (otpSection) {
        otpSection.style.display = 'block';
    }

    setTimeout(() => {
        const firstOtpInput = document.querySelector('.reset-otp');
        if (firstOtpInput) {
            firstOtpInput.focus();
        }
    }, 100);

    clearPasswordInputs();
    resetPasswordRequirements();
    hideError('passwordError');
}

// ==================== VALIDATION FUNCTIONS ====================

function isPasswordValid(password) {
    return password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password);
}

function clearPasswordInputs() {
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');

    if (newPassword) newPassword.value = '';
    if (confirmPassword) confirmPassword.value = '';
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

// ==================== MODAL FUNCTIONS ====================

function showSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function backToLogin() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.remove('active');
    }

    const accountForm = document.querySelector('.account-form');
    if (accountForm) {
        accountForm.classList.remove('active');
    }

    currentPhone = null;
    correctOtp = null;
    clearOtpTimer();
    clearResetPasswordOtpInputs();
    clearPasswordInputs();
    resetPasswordRequirements();
    hideMessages();

    setTimeout(() => {
        showLoginForm();
    }, 300);
}

function togglePassword(inputId, toggleElement) {
    const input = document.getElementById(inputId);
    const icon = toggleElement.querySelector('i');

    if (input && icon) {
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }
}

// ==================== UTILITY FUNCTIONS ====================

function validatePhone(phone) {
    return /^[0-9]{10}$/.test(phone);
}

function simulateAPI(delay = 1000) {
    return new Promise(resolve => setTimeout(resolve, delay));
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
        const span = errorElement.querySelector('span');
        if (span) span.textContent = message;
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
        const span = successElement.querySelector('span');
        if (span) span.textContent = message;
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
    const resetOtpInputs = document.querySelectorAll('.reset-otp');
    resetOtpInputs.forEach(input => input.classList.add('error'));
    setTimeout(() => {
        resetOtpInputs.forEach(input => input.classList.remove('error'));
    }, 500);
}

// ==================== TEST FUNCTIONS ====================

function testResetPasswordOtp() {
    console.log("🧪 Testing RESET PASSWORD OTP...");

    const resetOtpInputs = document.querySelectorAll('.reset-otp');
    resetOtpInputs.forEach((input, index) => {
        input.value = (index + 1).toString();
        input.classList.add('filled');
    });

    checkResetPasswordVerifyButton();
    console.log("✅ RESET PASSWORD OTP test completed - should see ENABLED button");
}

// ==================== GLOBAL EXPORTS ====================

// Make all functions globally accessible
window.showForgotPasswordForm = showForgotPasswordForm;
window.showLoginForm = showLoginForm;
window.sendForgotPasswordOTP = sendForgotPasswordOTP;
window.resetPassword = resetPassword;
window.resendOTP = resendOTP;
window.moveResetOtpNext = moveResetOtpNext;
window.moveRegisterOtpNext = moveRegisterOtpNext;
window.verifyOTP = verifyOTP;
window.togglePassword = togglePassword;
window.backToLogin = backToLogin;
window.backToOtpSection = backToOtpSection;
window.testResetPasswordOtp = testResetPasswordOtp;

// ==================== SIMPLE INITIALIZATION ====================

// Simple initialization - NO complex bindings
document.addEventListener('DOMContentLoaded', function () {
    console.log("🚀 SIMPLE forgot password loaded!");
    initializeForgotPassword();
});

console.log(`
✅ SIMPLE FORGOT PASSWORD HANDLER LOADED!

📝 CHỈ DÙNG INLINE HANDLERS:
- moveResetOtpNext()   -> Reset password OTP
- moveRegisterOtpNext() -> Register OTP

🧪 TEST:
- testResetPasswordOtp() -> Fill 1234 and enable button

🎯 NO COMPLEX EVENT BINDING - CHỈ INLINE oninput!
`);