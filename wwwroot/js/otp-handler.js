/**
 * OTP Handler - Xử lý xác thực OTP cho việc đổi số điện thoại
 * File: js/otp-handler.js
 */

class OTPHandler {
    constructor() {
        this.otpTimer = null;
        this.timeLeft = 180; // 3 phút
        this.correctOtp = null;
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
     * Gửi OTP tới server
     */
    async sendOtpToServer(phoneNumber) {
        try {
            this.showLoading(true);

            const response = await fetch('/api/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.getCsrfToken()
                },
                body: JSON.stringify({
                    phone: phoneNumber,
                    type: 'change_phone'
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showOtpModal(phoneNumber);
                this.startOtpTimer();
                console.log('OTP sent successfully');
            } else {
                throw new Error(data.message || 'Failed to send OTP');
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            alert('Có lỗi xảy ra khi gửi OTP. Vui lòng thử lại!');
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

        // Focus vào ô đầu tiên
        setTimeout(() => {
            document.querySelector('.otp-input').focus();
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
    }

    /**
     * Bắt đầu đếm ngược thời gian OTP
     */
    startOtpTimer() {
        this.timeLeft = 180; // Reset về 3 phút
        const resendBtn = document.getElementById('resendBtn');
        resendBtn.disabled = true;

        this.otpTimer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) {
                this.clearOtpTimer();
                resendBtn.disabled = false;
                this.showTimerExpired();
            }
        }, 1000);
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

        // Auto verify khi đủ 4 số
        const otpInputs = document.querySelectorAll('.otp-input');
        const allFilled = Array.from(otpInputs).every(input => input.value.length === 1);
        if (allFilled && !this.isVerifying) {
            setTimeout(() => this.verifyOtp(), 500);
        }

        // Xóa thông báo lỗi khi user nhập lại
        this.hideMessages();
    }

    /**
     * Xác thực OTP với server
     */
    async verifyOtp() {
        if (this.isVerifying) return;

        const otpInputs = document.querySelectorAll('.otp-input');
        const enteredOtp = Array.from(otpInputs).map(input => input.value).join('');

        if (enteredOtp.length !== 4) {
            this.showError('Vui lòng nhập đầy đủ 4 số!');
            return;
        }

        this.isVerifying = true;
        this.hideMessages();

        try {
            const response = await fetch('/api/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.getCsrfToken()
                },
                body: JSON.stringify({
                    phone: this.newPhoneNumber,
                    otp: enteredOtp,
                    type: 'change_phone'
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showSuccess();
                this.clearOtpTimer();

                setTimeout(() => {
                    this.updatePhoneNumber(this.newPhoneNumber);
                    this.closeOtpModal();
                    this.showProfileUpdateSuccess();
                }, 1500);
            } else {
                throw new Error(data.message || 'Invalid OTP');
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            this.showError('Mã OTP không chính xác!');
            this.clearOtpInputs();
            this.addErrorShakeEffect();
        } finally {
            this.isVerifying = false;
        }
    }

    /**
     * Gửi lại OTP
     */
    async resendOtp() {
        if (!this.newPhoneNumber) return;

        try {
            await this.sendOtpToServer(this.newPhoneNumber);
            this.resetOtpForm();
            alert('Đã gửi lại mã OTP!');
        } catch (error) {
            console.error('Error resending OTP:', error);
            alert('Có lỗi xảy ra khi gửi lại OTP. Vui lòng thử lại!');
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
        otpInputs[0].focus();
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
    showError(message = 'Mã OTP không chính xác!') {
        const errorElement = document.getElementById('otpError');
        const errorText = document.getElementById('errorText');

        errorText.textContent = message;
        errorElement.className = 'error-message show';

        setTimeout(() => {
            errorElement.classList.remove('show');
        }, 3000);
    }

    /**
     * Hiển thị thông báo thành công
     */
    showSuccess() {
        const successElement = document.getElementById('otpSuccess');
        successElement.className = 'success-message show';
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
        // Có thể thêm spinner loading ở đây
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

            // Xử lý paste
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