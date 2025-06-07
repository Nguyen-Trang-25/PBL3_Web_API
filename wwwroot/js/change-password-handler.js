/**
 * Change Password Handler - Xử lý đổi mật khẩu với OTP
 * File: js/change-password-handler.js
 */

let changePasswordOtpTimer = null;
let changePasswordTimeLeft = 180; // 3 phút
//let currentUserPhone = null; // Demo phone - thực tế sẽ lấy từ session/API
let correctChangePasswordOtp = null;
let isChangePasswordVerifying = false;
let currentPasswordData = null;

/**
 * Initialize change password functionality
 */
function initializeChangePassword() {
    console.log("Initializing change password functionality...");

    // Bind password validation events
    bindPasswordValidationEvents();

    // Bind OTP events
    bindChangePasswordOtpEvents();

    console.log("Change password events bound");
}

/**
 * Bind password validation events
 */
function bindPasswordValidationEvents() {
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmNewPassword');

    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function () {
            validatePasswordRequirements(this.value);
            checkPasswordMatch();
        });
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function () {
            checkPasswordMatch();
        });
    }
}

/**
 * Validate password requirements
 */
function validatePasswordRequirements(password) {
    const lengthCheck = document.getElementById('length-check');
    const uppercaseCheck = document.getElementById('uppercase-check');
    const lowercaseCheck = document.getElementById('lowercase-check');
    const numberCheck = document.getElementById('number-check');

    // Check length (at least 8 characters)
    if (password.length >= 8) {
        lengthCheck.classList.add('valid');
        lengthCheck.innerHTML = '<i class="fas fa-check"></i> Ít nhất 8 ký tự';
    } else {
        lengthCheck.classList.remove('valid');
        lengthCheck.innerHTML = '<i class="fas fa-times"></i> Ít nhất 8 ký tự';
    }

    // Check uppercase
    if (/[A-Z]/.test(password)) {
        uppercaseCheck.classList.add('valid');
        uppercaseCheck.innerHTML = '<i class="fas fa-check"></i> Ít nhất 1 chữ hoa';
    } else {
        uppercaseCheck.classList.remove('valid');
        uppercaseCheck.innerHTML = '<i class="fas fa-times"></i> Ít nhất 1 chữ hoa';
    }

    // Check lowercase
    if (/[a-z]/.test(password)) {
        lowercaseCheck.classList.add('valid');
        lowercaseCheck.innerHTML = '<i class="fas fa-check"></i> Ít nhất 1 chữ thường';
    } else {
        lowercaseCheck.classList.remove('valid');
        lowercaseCheck.innerHTML = '<i class="fas fa-times"></i> Ít nhất 1 chữ thường';
    }

    // Check number
    if (/[0-9]/.test(password)) {
        numberCheck.classList.add('valid');
        numberCheck.innerHTML = '<i class="fas fa-check"></i> Ít nhất 1 số';
    } else {
        numberCheck.classList.remove('valid');
        numberCheck.innerHTML = '<i class="fas fa-times"></i> Ít nhất 1 số';
    }
}

/**
 * Check if passwords match
 */
function checkPasswordMatch() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    const confirmInput = document.getElementById('confirmNewPassword');

    if (confirmPassword && newPassword !== confirmPassword) {
        confirmInput.style.borderColor = '#e74a3b';
        confirmInput.style.backgroundColor = 'rgba(231, 74, 59, 0.1)';
    } else if (confirmPassword) {
        confirmInput.style.borderColor = '#0eb582';
        confirmInput.style.backgroundColor = 'rgba(14, 181, 130, 0.1)';
    }
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility(inputId, toggleIcon) {
    const input = document.getElementById(inputId);
    const icon = toggleIcon.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

/**
 * Submit change password request// hàm này đã gửi OTP
 */
async function submitChangePassword() {
    const token = localStorage.getItem('token'); // <-- Lấy token ở đây
    if (!token) {
        console.error('Không tìm thấy token, vui lòng đăng nhập lại.');
        return;
    }
    console.log('Token:', token);

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
   
    console.log("hihi")
    // Validate inputs
    if (!validateChangePasswordForm(currentPassword, newPassword, confirmPassword)) {
        return;
    }

    currentPasswordData = {
        currentPassword: currentPassword,
        newPassword: newPassword
    };

    const submitButton = document.querySelector('#passwordStep .btn-primary');
    showChangePasswordLoading(submitButton, 'Đang xử lý...');
    try {
      
        const response = await fetch('/api/Verification/RequestChangePassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                currentPassword: currentPassword,
                newPassword: newPassword
            })
        });
        console.log('Fetch response received');
        const result = await response.json();
        console.log("có chạy k")
    
        if (!response.ok) {
            // Đây là chỗ ném lỗi ra ngoài để catch xử lý
            throw new Error(result.message || 'Đã xảy ra lỗi');
        }

        // Success - show OTP step
        showOtpVerificationStep();
        await sendChangePasswordOTP();

    } catch (error) {
        if (error.message === 'Mật khẩu hiện tại không chính xác.') {
            showChangePasswordError('passwordError', 'Mật khẩu hiện tại không chính xác!');
        } else {
            showChangePasswordError('passwordError', 'Có lỗi xảy ra khi xử lý yêu cầu!');
        }
    } finally {
        const submitButton = document.querySelector('#passwordStep .btn-primary');
        hideChangePasswordLoading(submitButton, '<i class="fas fa-paper-plane"></i> Gửi yêu cầu đổi mật khẩu');
    }
}

/**
 * Validate change password form
 */
function validateChangePasswordForm(currentPassword, newPassword, confirmPassword) {
    if (!currentPassword) {
        showChangePasswordError('passwordError', 'Vui lòng nhập mật khẩu hiện tại!');
        return false;
    }

    if (!newPassword) {
        showChangePasswordError('passwordError', 'Vui lòng nhập mật khẩu mới!');
        return false;
    }

    if (newPassword.length < 8) {
        showChangePasswordError('passwordError', 'Mật khẩu mới phải có ít nhất 8 ký tự!');
        return false;
    }

    if (!/[A-Z]/.test(newPassword)) {
        showChangePasswordError('passwordError', 'Mật khẩu mới phải có ít nhất 1 chữ hoa!');
        return false;
    }

    if (!/[a-z]/.test(newPassword)) {
        showChangePasswordError('passwordError', 'Mật khẩu mới phải có ít nhất 1 chữ thường!');
        return false;
    }

    if (!/[0-9]/.test(newPassword)) {
        showChangePasswordError('passwordError', 'Mật khẩu mới phải có ít nhất 1 số!');
        return false;
    }

    if (newPassword !== confirmPassword) {
        showChangePasswordError('passwordError', 'Mật khẩu xác nhận không khớp!');
        return false;
    }

    if (currentPassword === newPassword) {
        showChangePasswordError('passwordError', 'Mật khẩu mới phải khác mật khẩu hiện tại!');
        return false;
    }

    return true;
}

/**
 * Show OTP verification step
 */
function showOtpVerificationStep() {
    document.getElementById('passwordStep').style.display = 'none';
    document.getElementById('otpStep').style.display = 'block';

    // Display user phone
    const phoneDisplay = document.getElementById('userPhoneDisplay');
    phoneDisplay.textContent = currentUserPhone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');

    // Clear OTP inputs and focus
    clearChangePasswordOtpInputs();

    setTimeout(() => {
        const firstOtpInput = document.querySelector('.change-password-otp');
        if (firstOtpInput) {
            firstOtpInput.focus();
        }
    }, 100);
}

/**
 * Send OTP for change password
 */
/*async function sendChangePasswordOTP() {
    try {
        const response = await fetch('/api/Verification/RequestChangePassword', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                currentPassword: currentPasswordData.currentPassword,
                newPassword: currentPasswordData.newPassword
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Lỗi khi gửi OTP');
        }

        const data = await response.json();
        console.log('OTP sent:', data.message);

        startChangePasswordOtpTimer();
    } catch (error) {
        console.error('Error sending change password OTP:', error);
        showChangePasswordError('changePasswordOtpError', error.message);
    }
}*/

function sendChangePasswordOTP() {
    // Nếu backend đã gửi OTP rồi thì chỉ cần khởi động timer ở đây thôi
    startChangePasswordOtpTimer();
}


/**
 * Move to next OTP input
 */
function moveChangePasswordOtpNext(current, index) {
    // Only allow numbers
    if (current.value && !/^\d$/.test(current.value)) {
        current.value = '';
        return;
    }

    if (current.value.length === 1) {
        current.classList.add('filled');
        if (index < 3) {
            const nextInput = document.querySelectorAll('.change-password-otp')[index + 1];
            if (nextInput) {
                nextInput.focus();
            }
        }
    } else {
        current.classList.remove('filled');
    }

    // Enable/disable verify button
    const otpInputs = document.querySelectorAll('.change-password-otp');
    const verifyBtn = document.querySelector('#otpStep .btn-primary');
    const allFilled = Array.from(otpInputs).every(input => input.value.length === 1);

    if (verifyBtn) {
        verifyBtn.disabled = !allFilled;
    }

    hideChangePasswordMessages();
}

/**
 * Verify change password OTP
 */
async function verifyChangePasswordOTP() {
    if (isChangePasswordVerifying) return;

    const otpInputs = document.querySelectorAll('.change-password-otp');
    const enteredOtp = Array.from(otpInputs).map(input => input.value).join('');

    if (enteredOtp.length !== 4) {
        showChangePasswordError('changePasswordOtpError', 'Vui lòng nhập đủ 4 chữ số OTP!');
        addChangePasswordErrorEffect();
        return;
    }

    const verifyBtn = document.querySelector('#otpStep .btn-primary');
    isChangePasswordVerifying = true;

    try {
        showChangePasswordLoading(verifyBtn, 'Đang xác thực...');

        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Không tìm thấy token, vui lòng đăng nhập lại.');
        }

        const response = await fetch('/api/Verification/VerifyChangePasswordOtp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                otpCode: enteredOtp,
                purpose: 'Change Password' // nếu cần, bạn có thể bỏ dòng này nếu backend không dùng
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
        }

        showChangePasswordSuccess('changePasswordOtpSuccess', 'OTP chính xác!');
        setTimeout(() => {
            showChangePasswordSuccessModal();
        }, 1500);

    } catch (error) {
        showChangePasswordError('changePasswordOtpError', error.message || 'Có lỗi xảy ra khi xác thực OTP!');
        addChangePasswordErrorEffect();
        clearChangePasswordOtpInputs();
    } finally {
        hideChangePasswordLoading(verifyBtn, '<i class="fas fa-key"></i> Xác thực & Đổi mật khẩu');
        isChangePasswordVerifying = false;

        const allFilled = Array.from(otpInputs).every(input => input.value.length === 1);
        if (verifyBtn) {
            verifyBtn.disabled = !allFilled;
        }
    }
}


/**
 * Complete password change
 */
/*async function completePasswordChange() {
    try {
        console.log('Completing password change...');

        // Show loading on success message
        const successElement = document.getElementById('changePasswordOtpSuccess');
        if (successElement) {
            successElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Đang cập nhật mật khẩu...</span>';
        }

        // Simulate API call to change password
        await simulateAPI(2000);

        console.log('Password changed successfully:', currentPasswordData);

        clearChangePasswordOtpTimer();
        showChangePasswordSuccessModal();

    } catch (error) {
        showChangePasswordError('changePasswordOtpError', 'Có lỗi xảy ra khi cập nhật mật khẩu!');

        // Reset success message
        const successElement = document.getElementById('changePasswordOtpSuccess');
        if (successElement) {
            successElement.innerHTML = '<i class="fas fa-check-circle"></i> <span>OTP chính xác!</span>';
        }
    }
}

/**
 * Resend change password OTP
 */
/*async function resendChangePasswordOTP() {
    if (!currentUserPhone) {
        console.log('No phone number found');
        return;
    }

    console.log('Resending change password OTP...');

    try {
        const button = document.getElementById('changePasswordResendBtn');
        showChangePasswordLoadingBrief(button, 'Đang gửi...');

        await simulateAPI(1000);

        correctChangePasswordOtp = '1234';
        console.log(`Demo Change Password OTP mới: ${correctChangePasswordOtp}`);

        clearChangePasswordOtpInputs();
        hideChangePasswordMessages();
        startChangePasswordOtpTimer();

        showChangePasswordSuccess('changePasswordOtpSuccess', 'Đã gửi lại mã OTP thành công!');
        setTimeout(() => hideChangePasswordMessages(), 3000);

    } catch (error) {
        console.error('Error resending change password OTP:', error);
        showChangePasswordError('changePasswordOtpError', 'Có lỗi xảy ra khi gửi lại OTP!');
    } finally {
        const button = document.getElementById('changePasswordResendBtn');
        hideChangePasswordLoadingBrief(button, '<i class="fas fa-redo"></i> Gửi lại mã OTP');
    }
}*/
async function resendChangePasswordOTP() {

    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Không tìm thấy token, vui lòng đăng nhập lại.');
        return;
    }


    const button = document.getElementById('changePasswordResendBtn');
    // Lấy lại mật khẩu hiện tại + mật khẩu mới đã lưu (từ lần submitChangePassword trước)
    if (!currentPasswordData || !currentPasswordData.currentPassword || !currentPasswordData.newPassword) {
        console.log('Không có dữ liệu mật khẩu để gửi lại OTP');
        return;
    }
    showChangePasswordLoadingBrief(button, 'Đang gửi...');
    try {
     
        const response = await fetch('/api/Verification/RequestChangePassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                currentPassword: currentPasswordData.currentPassword,// dùng currentPassworđata
                newPassword: currentPasswordData.newPassword
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Lỗi khi gửi lại OTP');
        }


        clearChangePasswordOtpInputs();
        hideChangePasswordMessages();
        startChangePasswordOtpTimer();

        showChangePasswordSuccess('changePasswordOtpSuccess', 'Đã gửi lại mã OTP thành công!');
        setTimeout(() => hideChangePasswordMessages(), 3000);

    } catch (error) {
        console.error('Error resending change password OTP:', error);
        showChangePasswordError('changePasswordOtpError', 'Có lỗi xảy ra khi gửi lại OTP!');
    } finally {
        const button = document.getElementById('changePasswordResendBtn');
        hideChangePasswordLoadingBrief(button, '<i class="fas fa-redo"></i> Gửi lại mã OTP');
    }
}


/**
 * Start OTP timer
 */
function startChangePasswordOtpTimer() {
    changePasswordTimeLeft = 180; // 3 minutes
    const verifyBtn = document.querySelector('#otpStep .btn-primary');

    if (verifyBtn) {
        verifyBtn.disabled = true;
    }

    if (changePasswordOtpTimer) {
        clearInterval(changePasswordOtpTimer);
    }

    changePasswordOtpTimer = setInterval(() => {
        changePasswordTimeLeft--;
        updateChangePasswordTimerDisplay();

        if (changePasswordTimeLeft <= 0) {
            clearChangePasswordOtpTimer();
        }
    }, 1000);
}

/**
 * Update timer display
 */
function updateChangePasswordTimerDisplay() {
    const minutes = Math.floor(changePasswordTimeLeft / 60);
    const seconds = changePasswordTimeLeft % 60;
    const countdownElement = document.getElementById('changePasswordCountdown');

    if (countdownElement) {
        countdownElement.textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    const timerElement = document.getElementById('changePasswordOtpTimer');
    if (timerElement) {
        if (changePasswordTimeLeft <= 30) {
            timerElement.classList.add('expired');
        } else {
            timerElement.classList.remove('expired');
        }
    }
}

/**
 * Clear timer
 */
function clearChangePasswordOtpTimer() {
    if (changePasswordOtpTimer) {
        clearInterval(changePasswordOtpTimer);
        changePasswordOtpTimer = null;
    }
}

/**
 * Back to password form
 */
function backToPasswordForm() {
    document.getElementById('otpStep').style.display = 'none';
    document.getElementById('passwordStep').style.display = 'block';

    clearChangePasswordOtpTimer();
    clearChangePasswordOtpInputs();
    hideChangePasswordMessages();

    // Reset password data
    currentPasswordData = null;
}

/**
 * Show success modal - Updated version with proper centering
 */
function showChangePasswordSuccessModal() {
    const modal = document.getElementById('changePasswordSuccessModal');
    const body = document.body;

    if (modal) {
        // Add modal-open class to body to prevent scrolling
        body.classList.add('modal-open');

        // Show modal with active class for proper positioning
        modal.classList.add('active');

        // Focus on the modal for accessibility
        setTimeout(() => {
            modal.focus();
        }, 100);
    }
}

/**
 * Hide success modal
 */
function hideChangePasswordSuccessModal() {
    const modal = document.getElementById('changePasswordSuccessModal');
    const body = document.body;

    if (modal) {
        // Remove active class
        modal.classList.remove('active');

        // Remove modal-open class from body
        body.classList.remove('modal-open');
    }
}

/**
 * Redirect to login - Updated version
 */
function redirectToLogin() {
    // Hide modal first
    hideChangePasswordSuccessModal();

    // Clear all stored data
    currentPasswordData = null;
    correctChangePasswordOtp = null;
    clearChangePasswordOtpTimer();

    // Small delay before redirect for better UX
    setTimeout(() => {
        // Redirect to home page (which should show login)
        window.location.href = '/index.html';
    }, 300);
}

/**
 * Utility functions
 */
function clearChangePasswordOtpInputs() {
    const otpInputs = document.querySelectorAll('.change-password-otp');
    const verifyBtn = document.querySelector('#otpStep .btn-primary');

    otpInputs.forEach(input => {
        input.value = '';
        input.classList.remove('filled', 'error');
    });

    if (verifyBtn) {
        verifyBtn.disabled = true;
    }

    // Focus back to first input
    setTimeout(() => {
        const firstInput = document.querySelector('.change-password-otp');
        if (firstInput) {
            firstInput.focus();
        }
    }, 100);
}

function hideChangePasswordMessages() {
    hideChangePasswordError('changePasswordOtpError');
    const successElement = document.getElementById('changePasswordOtpSuccess');
    if (successElement) {
        successElement.classList.remove('show');
        successElement.style.display = 'none';
    }
}

function addChangePasswordErrorEffect() {
    const otpInputs = document.querySelectorAll('.change-password-otp');
    otpInputs.forEach(input => input.classList.add('error'));
    setTimeout(() => {
        otpInputs.forEach(input => input.classList.remove('error'));
    }, 500);
}

// Loading functions
function showChangePasswordLoading(button, text) {
    if (button) {
        button.disabled = true;
        button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
    }
}

function hideChangePasswordLoading(button, originalText) {
    if (button) {
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

function showChangePasswordLoadingBrief(button, text) {
    if (button) {
        button.disabled = true;
        button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
    }
}

function hideChangePasswordLoadingBrief(button, originalText) {
    if (button) {
        button.disabled = false;
        button.innerHTML = originalText;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
    }
}

// Message functions
function showChangePasswordError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        const span = element.querySelector('span');
        if (span) span.textContent = message;
        element.classList.add('show');
        element.style.display = 'flex';
    }
}

function hideChangePasswordError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('show');
        element.style.display = 'none';
    }
}

function showChangePasswordSuccess(elementId, message) {
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

/**
 * Bind OTP events
 */
function bindChangePasswordOtpEvents() {
    setTimeout(() => {
        const changePasswordOtpInputs = document.querySelectorAll('.change-password-otp');
        console.log('Found Change Password OTP inputs:', changePasswordOtpInputs.length);

        changePasswordOtpInputs.forEach((input, index) => {
            // Input event handler
            input.addEventListener('input', (e) => {
                moveChangePasswordOtpNext(e.target, index);
            });

            // Keydown event handler
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && input.value === '' && index > 0) {
                    const prevInput = changePasswordOtpInputs[index - 1];
                    prevInput.focus();
                    prevInput.classList.remove('filled');
                }

                if (e.key === 'Enter') {
                    verifyChangePasswordOTP();
                }

                // Only allow numbers
                if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                    e.preventDefault();
                }
            });

            // Paste event handler
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const paste = (e.clipboardData || window.clipboardData).getData('text');
                if (paste.match(/^\d{4}$/)) {
                    for (let i = 0; i < 4; i++) {
                        if (changePasswordOtpInputs[i]) {
                            changePasswordOtpInputs[i].value = paste[i];
                            changePasswordOtpInputs[i].classList.add('filled');
                        }
                    }

                    // Enable verify button
                    const verifyBtn = document.querySelector('#otpStep .btn-primary');
                    if (verifyBtn) {
                        verifyBtn.disabled = false;
                    }

                    setTimeout(() => verifyChangePasswordOTP(), 500);
                }
            });
        });
    }, 1000);
}

// Optional: Close modal when clicking outside (disabled for critical modal)
document.addEventListener('click', function (event) {
    const modal = document.getElementById('changePasswordSuccessModal');
    if (modal && event.target === modal) {
        // Don't allow closing by clicking outside for this critical modal
        // But you can enable it by uncommenting the line below:
        // hideChangePasswordSuccessModal();
    }
});

// Optional: Close modal with Escape key (disabled for critical modal)
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('changePasswordSuccessModal');
        if (modal && modal.classList.contains('active')) {
            // Don't allow closing with Escape for this critical modal
            // But you can enable it by uncommenting the line below:
            // hideChangePasswordSuccessModal();
        }
    }
});

// Make functions globally accessible
window.togglePasswordVisibility = togglePasswordVisibility;
window.submitChangePassword = submitChangePassword;
window.moveChangePasswordOtpNext = moveChangePasswordOtpNext;
window.verifyChangePasswordOTP = verifyChangePasswordOTP;
window.resendChangePasswordOTP = resendChangePasswordOTP;
window.backToPasswordForm = backToPasswordForm;
window.redirectToLogin = redirectToLogin;
window.showChangePasswordSuccessModal = showChangePasswordSuccessModal;
window.hideChangePasswordSuccessModal = hideChangePasswordSuccessModal;

// Initialize when DOM loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('Change Password Handler initialized');
    initializeChangePassword();
});