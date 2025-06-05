/**
 * Register Handler - FINAL VERSION
 * NÚT "GỬI LẠI OTP" LUÔN ACTIVE
 */

let registerOtpTimer = null;
let registerTimeLeft = 180;
let currentRegisterPhone = null;
let currentRegisterData = null;
let correctRegisterOtp = null;

/**
 * Initialize register functionality
 */
function initializeRegister() {
    console.log("Initializing register functionality...");

    setTimeout(() => {
        bindRegisterEvents();
    }, 300);
}

/**
 * Bind events for register
 */
function bindRegisterEvents() {
    bindRegisterPhoneValidation();
    bindRegisterPasswordValidation();
    console.log("Register events bound");
}

/**
 * Bind phone input validation
 */
function bindRegisterPhoneValidation() {
    const phoneInput = document.getElementById('registerPhoneInput');

    if (phoneInput) {
        phoneInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/[^0-9]/g, '');
            if (value.length > 10) {
                value = value.slice(0, 10);
            }
            e.target.value = value;

            if (value.length > 0) {
                hideError('registerError');
            }
        });

        phoneInput.addEventListener('paste', function (e) {
            e.preventDefault();
            let paste = (e.clipboardData || window.clipboardData).getData('text');
            paste = paste.replace(/[^0-9]/g, '').slice(0, 10);
            e.target.value = paste;
        });

        phoneInput.addEventListener('keypress', function (e) {
            if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                e.preventDefault();
            }
        });
    }
}

/**
 * Bind password validation
 */
function bindRegisterPasswordValidation() {
    const passwordInput = document.getElementById('registerPassword');
    const confirmPasswordInput = document.getElementById('registerConfirmPassword');

    if (passwordInput && confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function () {
            if (this.value && passwordInput.value !== this.value) {
                this.style.borderColor = '#e74a3b';
            } else {
                this.style.borderColor = '#0eb582';
            }
        });
    }
}

/**
 * Gửi OTP đăng ký
 */
async function sendRegisterOTP() {
    const phone = document.getElementById('registerPhoneInput').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const role = document.querySelector('input[name="role"]:checked');

    if (!validateRegisterForm(phone, password, confirmPassword, role)) {
        return;
    }

    currentRegisterData = {
        phone: phone,
        password: password,
        role: role.value
    };

    const button = document.querySelector('.register-form .btn');

    try {
      
        showLoading(button, 'Đang gửi...');

        const response = await fetch('/api/Auth/RequestRegister', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(currentRegisterData)
        });

        const result = await response.json();

        if (!response.ok) {
            if (result.message === "Số điện thoại đã được đăng ký") {
                showError('registerError', 'Số điện thoại đã được đăng ký!');
            } else if (result.message === "Bạn đã gửi yêu cầu đăng ký. Vui lòng xác nhận OTP.") {
                showError('registerError', 'Bạn đã gửi yêu cầu đăng ký. Vui lòng xác nhận OTP!');
            } else {
                showError('registerError', 'Có lỗi xảy ra khi gửi OTP!');
            }
            return;
        }
        // Thành công
        console.log("OTP đã gửi:", result.message);
        currentRegisterPhone = phone;

        showRegisterOtpForm();
        startRegisterOtpTimer();

    } catch (error) {
        console.error("Lỗi khi gửi OTP:", error);
        showError('registerError', 'Lỗi kết nối máy chủ!');
    } finally {
        hideLoading(button, '<i class="fas fa-user-plus"></i> Đăng ký');// ẩn trạng thái loading đi 
    }
}

       

/**
 * Validate form đăng ký
 */
function validateRegisterForm(phone, password, confirmPassword, role) {
    if (!validatePhone(phone)) {
        showError('registerError', 'Số điện thoại không hợp lệ! Vui lòng nhập 10 chữ số.');
        return false;
    }

    if (password.length < 6) {
        showError('registerError', 'Mật khẩu phải có ít nhất 6 ký tự!');
        return false;
    }

    if (password !== confirmPassword) {
        showError('registerError', 'Mật khẩu xác nhận không khớp!');
        return false;
    }

    if (!role) {
        showError('registerError', 'Vui lòng chọn vai trò!');
        return false;
    }

    return true;
}

/**
 * Hiển thị form OTP đăng ký
 */
function showRegisterOtpForm() {
    hideAllForms();
    document.querySelector('.register-otp-form').classList.add('active');

    const phoneDisplay = document.getElementById('registerPhoneDisplay');
    phoneDisplay.textContent = currentRegisterPhone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');

    clearRegisterOtpInputs();

    // QUAN TRỌNG: Đảm bảo resend button active ngay khi hiển thị form
    setTimeout(() => {
        ensureResendButtonActive();
        document.querySelector('.register-otp').focus();
    }, 100);
}

/**
 * Di chuyển focus giữa các ô OTP
 */
function moveRegisterOtpNext(current, index) {
    if (current.value && !/^\d$/.test(current.value)) {
        current.value = '';
        return;
    }

    if (current.value.length === 1) {
        current.classList.add('filled');
        if (index < 3) {
            document.querySelectorAll('.register-otp')[index + 1].focus();
        }
    } else {
        current.classList.remove('filled');
    }

    const otpInputs = document.querySelectorAll('.register-otp');
    const verifyBtn = document.querySelector('.register-otp-form .btn-primary');
    const allFilled = Array.from(otpInputs).every(input => input.value.length === 1);

    if (verifyBtn) {
        verifyBtn.disabled = !allFilled;
    }

    hideRegisterMessages();
}

/**
 * Xác thực OTP đăng ký
 */
async function verifyRegisterOTP() {
    console.log("verifyRegisterOTP called");


    const otpInputs = document.querySelectorAll('.register-otp');
    const enteredOtp = Array.from(otpInputs).map(input => input.value).join('');

    if (enteredOtp.length !== 4) {
        showError('registerOtpError', 'Vui lòng nhập đủ 4 chữ số OTP!');
        addRegisterErrorEffect();
        return;
    }

    const verifyBtn = document.querySelector('.register-otp-form .btn-primary');

    try {
        showLoading(verifyBtn, 'Đang xác thực...');
        const response = await fetch('/api/Auth/ConfirmRegister', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone: currentRegisterPhone,  // biến lưu số điện thoại đã gửi OTP
                otpCode: enteredOtp
            })
        });
        const result = await response.json();

        if (!response.ok) {
            showError('registerOtpError', result.message || 'Xác thực OTP thất bại!');
            addRegisterErrorEffect();
            clearRegisterOtpInputs();
            return;
        }
        showSuccess('registerOtpSuccess', result.message || 'Đăng ký thành công!');
        clearRegisterOtpInputs();

        setTimeout(() => {
            showRegisterSuccessModal();
        }, 500);

    } catch (error) {
        showError('registerOtpError', 'Có lỗi xảy ra khi xác thực OTP!');
        addRegisterErrorEffect();
    } finally {
        hideLoading(verifyBtn, '<i class="fas fa-check-circle"></i> Xác thực & Tạo tài khoản');

        if (verifyBtn) {
            verifyBtn.disabled = true;
        }
    }
}


/**
 * ===== FIXED: Gửi lại OTP - LUÔN ACTIVE =====
 */
async function resendRegisterOTP() {
    console.log('🔥 RESEND BUTTON CLICKED!');

    if (!currentRegisterData || !currentRegisterData.phone) {
        console.log('⚠️ No phone number or registration data found!');
        return;
    }
    const button = document.getElementById('registerResendBtn');
    try {
    
        showLoadingBrief(button, 'Đang gửi lại...');

        const response = await fetch('/api/Auth/RequestRegister', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(currentRegisterData)
        });

        const result = await response.json();
        console.log("🔍 Full Response:", response);
        console.log("📨 Parsed JSON:", result);

        if (!response.ok) {
            if (result.message === "Số điện thoại đã được đăng ký") {
                showError('registerOtpError', 'Số điện thoại đã được đăng ký!');
            } else if (result?.message?.includes("Vui lòng đợi")) {
                showError('registerOtpError', result.message);
            } else {
                showError('registerOtpError', result.message || 'Có lỗi xảy ra khi gửi lại OTP!');
            }
            return;
        }

        // Thành công
        console.log("✅ OTP resend success:", result.message);

        clearRegisterOtpInputs();
        hideRegisterMessages();
        startRegisterOtpTimer();

        showSuccess('registerOtpSuccess', 'Đã gửi lại mã OTP thành công!');
        setTimeout(() => hideRegisterMessages(), 3000);

    } catch (error) {
        console.error('Error resending OTP:', error);
        showError('registerOtpError', 'Lỗi kết nối máy chủ!');
    } finally {
        const button = document.getElementById('registerResendBtn');
        hideLoadingBrief(button, '<i class="fas fa-redo"></i> Gửi lại mã OTP');
        ensureResendButtonActive();
    }
}


/**
 * ===== TIMER KHÔNG ẢNH HƯỞNG ĐẾN RESEND BUTTON =====
 */
function startRegisterOtpTimer() {
    registerTimeLeft = 180;
    const verifyBtn = document.querySelector('.register-otp-form .btn-primary');

    if (verifyBtn) {
        verifyBtn.disabled = true;
    }

    if (registerOtpTimer) {
        clearInterval(registerOtpTimer);
    }

    // QUAN TRỌNG: Đảm bảo resend button luôn enabled
    ensureResendButtonActive();

    registerOtpTimer = setInterval(() => {
        registerTimeLeft--;
        updateRegisterTimerDisplay();

        if (registerTimeLeft <= 0) {
            clearRegisterOtpTimer();
            // Vẫn đảm bảo resend button active
            ensureResendButtonActive();
        }
    }, 1000);
}

/**
 * ===== ĐẢM BẢO RESEND BUTTON LUÔN ACTIVE =====
 */
function ensureResendButtonActive() {
    const resendBtn = document.getElementById('registerResendBtn');
    if (resendBtn) {
        resendBtn.disabled = false;
        resendBtn.style.opacity = '1';
        resendBtn.style.cursor = 'pointer';
        resendBtn.style.pointerEvents = 'auto';
        resendBtn.removeAttribute('disabled'); // Xóa luôn attribute
        console.log('✅ Resend button is ALWAYS active');
    } else {
        console.log('❌ Resend button not found');
    }
}

/**
 * Update timer display
 */
function updateRegisterTimerDisplay() {
    const minutes = Math.floor(registerTimeLeft / 60);
    const seconds = registerTimeLeft % 60;
    const countdownElement = document.getElementById('registerCountdown');

    if (countdownElement) {
        countdownElement.textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    const timerElement = document.getElementById('registerOtpTimer');
    if (timerElement) {
        if (registerTimeLeft <= 30) {
            timerElement.classList.add('expired');
        } else {
            timerElement.classList.remove('expired');
        }
    }
}

/**
 * Clear timer
 */
function clearRegisterOtpTimer() {
    if (registerOtpTimer) {
        clearInterval(registerOtpTimer);
        registerOtpTimer = null;
    }
}

/**
 * Navigation functions
 */
function backToRegisterForm() {
    hideAllForms();
    document.querySelector('.register-form').classList.add('active');
    document.querySelector('.register-btn').classList.add('active');
    document.querySelector('.login-btn').classList.remove('active');

    currentRegisterPhone = null;
    correctRegisterOtp = null;
    clearRegisterOtpTimer();
    clearRegisterOtpInputs();
    hideRegisterMessages();
}

function showRegisterSuccessModal() {
    document.getElementById('registerSuccessModal').classList.add('active');
}

function backToLoginAfterRegister() {
    document.getElementById('registerSuccessModal').classList.remove('active');
    document.querySelector('.account-form').classList.remove('active');

    currentRegisterPhone = null;
    currentRegisterData = null;
    correctRegisterOtp = null;
    clearRegisterOtpTimer();
    clearRegisterOtpInputs();
    hideRegisterMessages();

    setTimeout(() => {
        showLoginForm();
    }, 300);
}

/**
 * Utility functions
 */
function clearRegisterOtpInputs() {
    const otpInputs = document.querySelectorAll('.register-otp');
    const verifyBtn = document.querySelector('.register-otp-form .btn-primary');

    otpInputs.forEach(input => {
        input.value = '';
        input.classList.remove('filled', 'error');
    });

    if (verifyBtn) {
        verifyBtn.disabled = true;
    }

    // QUAN TRỌNG: Đảm bảo resend button vẫn active
    ensureResendButtonActive();
}

function hideRegisterMessages() {
    hideError('registerOtpError');
    const successElement = document.getElementById('registerOtpSuccess');
    if (successElement) {
        successElement.classList.remove('show');
    }
}

function addRegisterErrorEffect() {
    const otpInputs = document.querySelectorAll('.register-otp');
    otpInputs.forEach(input => input.classList.add('error'));
    setTimeout(() => {
        otpInputs.forEach(input => input.classList.remove('error'));
    }, 500);
}

// ===== LOADING FUNCTIONS =====

function showLoadingBrief(button, text) {
    if (button) {
        button.disabled = true;
        button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
    }
}

function hideLoadingBrief(button, originalText) {
    if (button) {
        button.disabled = false;
        button.innerHTML = originalText;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
        button.removeAttribute('disabled');
    }
}

function showLoading(button, text) {
    if (button) {
        button.disabled = true;
        button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
    }
}

function hideLoading(button, originalText) {
    if (button) {
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

// ===== UTILITY FUNCTIONS =====

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        const span = element.querySelector('span');
        if (span) span.textContent = message;
        element.classList.add('show');
        element.style.display = 'flex';
    }
}

function hideError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('show');
        element.style.display = 'none';
    }
}

function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        const span = element.querySelector('span');
        if (span) span.textContent = message;
        element.classList.add('show');
        element.style.display = 'flex';
    }
}

function simulateAPI(delay = 1000) {
    return new Promise(resolve => setTimeout(resolve, delay));
}

function validatePhone(phone) {
    return /^[0-9]{10}$/.test(phone);
}

function hideAllForms() {
    const forms = document.querySelectorAll('.account-form form');
    forms.forEach(form => form.classList.remove('active'));
}

// ===== GLOBAL FUNCTIONS =====

window.sendRegisterOTP = sendRegisterOTP;
window.moveRegisterOtpNext = moveRegisterOtpNext;
window.verifyRegisterOTP = verifyRegisterOTP;
window.resendRegisterOTP = resendRegisterOTP;
window.backToRegisterForm = backToRegisterForm;
window.backToLoginAfterRegister = backToLoginAfterRegister;
window.initializeRegister = initializeRegister;


// ===== EVENT BINDING =====
console.log("hihi")
// Trong register-handler.js
function setupRegisterOTPEvents() {
    console.log('DOM loaded, setting up register OTP events...');

    const sendOtpBtn = document.getElementById('sendOtpBtn');
    console.log('sendOtpBtn:', sendOtpBtn);

    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', function (e) {
            console.log("Clicked send OTP");
            e.preventDefault();
            sendRegisterOTP();
        });
    }

    const registerOtpInputs = document.querySelectorAll('.register-otp');
    console.log('Found OTP inputs:', registerOtpInputs.length);

    registerOtpInputs.forEach((input, index) => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && input.value === '' && index > 0) {
                registerOtpInputs[index - 1].focus();
            }
            if (e.key === 'Enter') {
                verifyRegisterOTP();
            }
        });

        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            if (paste.match(/^\d{4}$/)) {
                for (let i = 0; i < 4; i++) {
                    if (registerOtpInputs[i]) {
                        registerOtpInputs[i].value = paste[i];
                    }
                }
                setTimeout(() => verifyRegisterOTP(), 500);
            }
        });
    });

    ensureResendButtonActive();
    setInterval(() => ensureResendButtonActive(), 2000);
}


