/**
 * OTP Handler - Xử lý xác thực OTP cho việc đổi số điện thoại
 * File: js/otp-handler.js
 * Updated with test OTP functionality like register form
 */

class OTPHandler {
    constructor() {
        this.otpTimer = null;
        this.timeLeft = 180; // 3 phút
        this.correctOtp = null; // Sẽ được set thành '1234' cho test
        this.newPhoneNumber = null;
        this.isVerifying = false;

        this.init();
    }

    init() {
        // Bind events cho OTP inputs
        this.bindOtpInputEvents();

        // Bind events cho form chính
        this.bindProfileFormEvents();
    }

    /**
     * Mở modal nhập số điện thoại mới
     */
    openPhoneChangeModal() {
        document.getElementById('phoneInputOverlay').classList.add('active');

        // Focus vào input và clear giá trị cũ
        setTimeout(() => {
            const phoneInput = document.getElementById('newPhoneInput');
            phoneInput.value = '';
            phoneInput.focus();
            this.hidePhoneInputError();
        }, 300);
    }

    /**
     * Đóng modal nhập số điện thoại
     */
    closePhoneInputModal() {
        document.getElementById('phoneInputOverlay').classList.remove('active');
        this.hidePhoneInputError();
    }

    /**
     * Xác nhận thay đổi số điện thoại
     */
    confirmPhoneChange() {
        const phoneInput = document.getElementById('newPhoneInput');
        const newPhone = phoneInput.value.trim();

        if (!this.validatePhoneNumber(newPhone)) {
            this.showPhoneInputError('Số điện thoại không hợp lệ! Vui lòng nhập 10 chữ số.');
            phoneInput.classList.add('error');
            return;
        }

        phoneInput.classList.remove('error');
        this.newPhoneNumber = newPhone;
        this.closePhoneInputModal();
        this.sendOtpToServer(newPhone);
    }

    /**
     * Hiển thị lỗi input số điện thoại
     */
    showPhoneInputError(message) {
        const errorElement = document.getElementById('phoneInputError');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    /**
     * Ẩn lỗi input số điện thoại
     */
    hidePhoneInputError() {
        const errorElement = document.getElementById('phoneInputError');
        errorElement.classList.remove('show');
        document.getElementById('newPhoneInput').classList.remove('error');
    }

    /**
     * Validate số điện thoại
     */
    validatePhoneNumber(phone) {
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phone);
    }

    /**
     * Gửi OTP tới server (Demo mode với OTP test 1234)
     */
    async sendOtpToServer(phoneNumber) {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Không tìm thấy token, vui lòng đăng nhập lại.');
            alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            return;
        }

        console.log('Token:', token);

        try {
            this.showLoading(true);

            const response = await fetch('/api/Verification/RequestChangePhone', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newphone: phoneNumber })
            });

            const data = await response.json();

            if (response.ok) {
                this.showOtpModal(phoneNumber);
                this.startOtpTimer();
                console.log('✅ OTP sent successfully');
            } else {
                const errorMessage = data.message || '❌ Gửi OTP thất bại. Vui lòng thử lại!';
                this.showError(errorMessage);  // Hiển thị lỗi lên UI
                console.warn('⚠️ Server error:', errorMessage);
            }

        } catch (error) {
            console.error('❌ Error sending OTP:', error);
            this.showError('Có lỗi xảy ra khi gửi OTP. Vui lòng thử lại!');
        } finally {
            this.showLoading(false);
        }
    }


    /**
     * Hiển thị modal OTP
     */
    showOtpModal(phoneNumber) {
        document.getElementById('newPhoneDisplay').textContent =
            phoneNumber.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
        document.getElementById('otpOverlay').classList.add('active');

        // Focus vào ô đầu tiên và đảm bảo resend button active
        setTimeout(() => {
            document.querySelector('.otp-input').focus();
            this.ensureResendButtonActive();
        }, 300);
    }

    /**
     * Đóng modal OTP
     */
    closeOtpModal() {
        document.getElementById('otpOverlay').classList.remove('active');
        this.clearOtpTimer();
        this.resetOtpForm();
        this.newPhoneNumber = null;
        this.correctOtp = null;
    }

    /**
     * Bắt đầu đếm ngược thời gian OTP
     */
    startOtpTimer() {
        this.timeLeft = 180; // Reset về 3 phút
        const resendBtn = document.getElementById('resendBtn');

        // Đảm bảo resend button luôn active như register form
        this.ensureResendButtonActive();

        this.otpTimer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) {
                this.clearOtpTimer();
                // Vẫn đảm bảo resend button active
                this.ensureResendButtonActive();
            }
        }, 1000);
    }

    /**
     * Đảm bảo resend button luôn active như register form
     */
    ensureResendButtonActive() {
        const resendBtn = document.getElementById('resendBtn');
        if (resendBtn) {
            resendBtn.disabled = false;
            resendBtn.style.opacity = '1';
            resendBtn.style.cursor = 'pointer';
            resendBtn.style.pointerEvents = 'auto';
            resendBtn.removeAttribute('disabled');
            console.log('✅ OTP Resend button is ALWAYS active');
        }
    }

    /**
     * Cập nhật hiển thị thời gian
     */
    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const countdownElement = document.getElementById('countdown');

        countdownElement.textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Đổi màu khi còn ít thời gian
        const timerElement = document.getElementById('otpTimer');
        if (this.timeLeft <= 30) {
            timerElement.classList.add('expired');
        } else {
            timerElement.classList.remove('expired');
        }
    }

    /**
     * Hiển thị thông báo hết thời gian
     */
    showTimerExpired() {
        const errorElement = document.getElementById('otpError');
        const errorText = document.getElementById('errorText');

        errorText.textContent = 'Mã OTP đã hết hạn! Vui lòng gửi lại mã mới.';
        this.showError();
    }

    /**
     * Xóa timer
     */
    clearOtpTimer() {
        if (this.otpTimer) {
            clearInterval(this.otpTimer);
            this.otpTimer = null;
        }
    }

    /**
     * Di chuyển focus giữa các ô OTP
     */
    moveToNext(current, index) {
        // Chỉ cho phép nhập số
        if (current.value && !/^\d$/.test(current.value)) {
            current.value = '';
            return;
        }

        if (current.value.length === 1) {
            current.classList.add('filled');
            // Di chuyển tới ô tiếp theo
            if (index < 3) {
                document.querySelectorAll('.otp-input')[index + 1].focus();
            }
        } else {
            current.classList.remove('filled');
        }

        // Auto verify khi đủ 4 số như register form
        const otpInputs = document.querySelectorAll('.otp-input');
        const allFilled = Array.from(otpInputs).every(input => input.value.length === 1);
        if (allFilled && !this.isVerifying) {
            setTimeout(() => this.verifyOtp(), 500);
        }

        // Xóa thông báo lỗi khi user nhập lại
        this.hideMessages();
    }

    /**
     * Xác thực OTP với test code 1234
     */
    async verifyOtp() {
        if (this.isVerifying) return;

        const otpInputs = document.querySelectorAll('.otp-input');
        const enteredOtp = Array.from(otpInputs).map(input => input.value).join('');

        if (enteredOtp.length !== 4) {
            this.showError('Vui lòng nhập đầy đủ 4 số!');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            this.showError('Bạn cần đăng nhập lại!');
            return;
        }

        this.isVerifying = true;
        this.hideMessages();

        try {
            const response = await fetch('/api/Verification/ConfirmChangePhone', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    newPhone: this.newPhoneNumber,
                    otpCode: enteredOtp
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.showSuccess();
                this.clearOtpTimer();

                setTimeout(() => {
                    this.updatePhoneNumber(this.newPhoneNumber);
                    this.closeOtpModal();
                    this.showProfileUpdateSuccess();
                }, 1500);
            } else {
                throw new Error(data.message || 'Mã OTP không hợp lệ!');
            }
        } catch (error) {
            console.error('❌ Error verifying OTP:', error);
            this.showError('Mã OTP không chính xác!');
            this.clearOtpInputs();
            this.addErrorShakeEffect();
        } finally {
            this.isVerifying = false;
        }
    }

    /**
     * Gửi lại OTP - luôn active như register form
     */
    async resendOtp() {
        console.log('🔥 OTP RESEND BUTTON CLICKED!');

        if (!this.newPhoneNumber) {
            console.log('No phone number found');
            return;
        }

        const button = document.getElementById('resendBtn');
        this.showLoadingBrief(button, 'Đang gửi...');

        try {
            const response = await fetch('/RequestChangePhone', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    newphone: this.newPhoneNumber
                })
            });

            if (!response.ok) {
                throw new Error('❌ Gửi OTP thất bại');
            }

            const result = await response.json();
            console.log('✅ OTP resend response:', result);

            // Reset OTP test (chỉ dùng cho debug)
            // this.correctOtp = '1234'; // Có thể bỏ nếu dùng OTP thật

            this.clearOtpInputs();
            this.hideMessages();
            this.startOtpTimer();

            this.showResendSuccess(result.message || 'OTP đã được gửi');
            setTimeout(() => this.hideMessages(), 3000);

        } catch (error) {
            console.error('Error resending OTP:', error);
            this.showError('Có lỗi xảy ra khi gửi lại OTP!');
        } finally {
            this.hideLoadingBrief(button, '<i class="fas fa-redo"></i> Gửi lại');
            this.ensureResendButtonActive();
        }
    }


    /**
     * Reset form OTP
     */
    resetOtpForm() {
        this.clearOtpInputs();
        this.hideMessages();
        this.isVerifying = false;
    }

    /**
     * Xóa các ô input OTP
     */
    clearOtpInputs() {
        const otpInputs = document.querySelectorAll('.otp-input');
        otpInputs.forEach(input => {
            input.value = '';
            input.classList.remove('filled', 'error');
        });
        // Focus về ô đầu tiên
        if (otpInputs.length > 0) {
            otpInputs[0].focus();
        }

        // Đảm bảo resend button vẫn active
        this.ensureResendButtonActive();
    }

    /**
     * Thêm hiệu ứng rung khi lỗi
     */
    addErrorShakeEffect() {
        const otpInputs = document.querySelectorAll('.otp-input');
        otpInputs.forEach(input => {
            input.classList.add('error');
        });

        setTimeout(() => {
            otpInputs.forEach(input => {
                input.classList.remove('error');
            });
        }, 500);
    }

    /**
     * Hiển thị thông báo lỗi
     */
    showError(message) {
        const errorElement = document.getElementById('otpError');
        const errorText = document.getElementById('errorText');

        if (errorElement && errorText) {
            errorText.textContent = message || 'Đã xảy ra lỗi. Vui lòng thử lại!';
            errorElement.classList.add('show');

            setTimeout(() => {
                errorElement.classList.remove('show');
            }, 3000);
        } else {
            console.error('Không tìm thấy phần tử hiển thị lỗi.');
        }
    }


    /**
     * Hiển thị thông báo gửi lại OTP thành công
     */
    showResendSuccess() {
        const successElement = document.getElementById('otpSuccess');
        if (successElement) {
            // Cập nhật nội dung trực tiếp
            successElement.innerHTML = '<i class="fas fa-check-circle"></i> Đã gửi lại mã OTP thành công!';
            successElement.className = 'success-message show';
        }
    }

    /**
     * Hiển thị thông báo thành công
     */
    showSuccess(message = 'Xác thực thành công!') {
        const successElement = document.getElementById('otpSuccess');
        if (successElement) {
            // Cập nhật nội dung trực tiếp với icon
            successElement.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
            successElement.className = 'success-message show';
        }
    }

    /**
     * Ẩn tất cả thông báo
     */
    hideMessages() {
        document.getElementById('otpError').classList.remove('show');
        document.getElementById('otpSuccess').classList.remove('show');
    }

    /**
     * Cập nhật số điện thoại trong form
     */
    updatePhoneNumber(newPhone) {
        document.getElementById('phone').value = newPhone;
    }

    /**
     * Hiển thị thông báo cập nhật profile thành công
     */
    showProfileUpdateSuccess() {
        const resultDiv = document.getElementById('updateResult');
        resultDiv.style.display = 'block';
        setTimeout(() => {
            resultDiv.style.display = 'none';
        }, 3000);
    }

    /**
     * Hiển thị/ẩn loading
     */
    showLoading(show) {
        const changeBtn = document.querySelector('.change-phone-btn');
        if (show) {
            changeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
            changeBtn.disabled = true;
        } else {
            changeBtn.innerHTML = '<i class="fas fa-edit"></i> Đổi';
            changeBtn.disabled = false;
        }
    }

    /**
     * Loading functions cho resend button
     */
    showLoadingBrief(button, text) {
        if (button) {
            button.disabled = true;
            button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
        }
    }

    hideLoadingBrief(button, originalText) {
        if (button) {
            button.disabled = false;
            button.innerHTML = originalText;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
            button.removeAttribute('disabled');
        }
    }

    /**
     * Simulate API call
     */
    simulateAPI(delay = 1000) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    /**
     * Lấy CSRF token
     */
    getCsrfToken() {
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        return metaTag ? metaTag.getAttribute('content') : '';
    }

    /**
     * Bind events cho OTP inputs
     */
    bindOtpInputEvents() {
        const otpInputs = document.querySelectorAll('.otp-input');

        otpInputs.forEach((input, index) => {
            // Xử lý nhập liệu
            input.addEventListener('input', (e) => {
                this.moveToNext(e.target, index);
            });

            // Xử lý phím Backspace
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && input.value === '' && index > 0) {
                    const prevInput = otpInputs[index - 1];
                    prevInput.focus();
                    prevInput.classList.remove('filled');
                }

                // Xử lý phím Enter
                if (e.key === 'Enter') {
                    this.verifyOtp();
                }
            });

            // Xử lý paste như register form
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
                    setTimeout(() => this.verifyOtp(), 500);
                }
            });
        });
    }

    /**
     * Bind events cho form profile chính
     */
    bindProfileFormEvents() {
        const profileForm = document.getElementById("profileForm");
        if (profileForm) {
            profileForm.addEventListener("submit", (e) => {
                e.preventDefault();
                this.showProfileUpdateSuccess();
            });
        }

        // Bind event cho input số điện thoại mới
        const phoneInput = document.getElementById('newPhoneInput');
        if (phoneInput) {
            // Chỉ cho phép nhập số
            phoneInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                if (e.target.value.length > 0) {
                    this.hidePhoneInputError();
                }
            });

            // Xử lý phím Enter
            phoneInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.confirmPhoneChange();
                }
            });
        }
    }
}

// Global functions để gọi từ HTML
let otpHandler;

// Khởi tạo khi DOM loaded
document.addEventListener('DOMContentLoaded', function () {
    otpHandler = new OTPHandler();

    // Đảm bảo resend button luôn active như register form
    setTimeout(() => {
        if (otpHandler) {
            setInterval(() => {
                otpHandler.ensureResendButtonActive();
            }, 2000);
        }
    }, 1000);
});

// Global functions
function openPhoneChangeModal() {
    otpHandler.openPhoneChangeModal();
}

function closePhoneInputModal() {
    otpHandler.closePhoneInputModal();
}

function confirmPhoneChange() {
    otpHandler.confirmPhoneChange();
}

function closeOtpModal() {
    otpHandler.closeOtpModal();
}

function moveToNext(current, index) {
    otpHandler.moveToNext(current, index);
}

function verifyOtp() {
    otpHandler.verifyOtp();
}

function resendOtp() {
    otpHandler.resendOtp();
}