// ===== ADMIN PROFILE MANAGEMENT SCRIPT =====

class AdminProfile {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadProfileData();
    }

    // ===== EVENT BINDING =====
    bindEvents() {
        // Edit Profile Modal
        document.getElementById('editProfileBtn').addEventListener('click', () => {
            this.openEditProfileModal();
        });

        document.getElementById('closeEditModal').addEventListener('click', () => {
            this.closeModal('editProfileModal');
        });

        document.getElementById('cancelEditBtn').addEventListener('click', () => {
            this.closeModal('editProfileModal');
        });

        document.getElementById('saveProfileBtn').addEventListener('click', () => {
            this.saveProfile();
        });

        // Change Password Modal
        document.getElementById('changePasswordBtn').addEventListener('click', () => {
            this.openChangePasswordModal();
        });

        document.getElementById('closePasswordModal').addEventListener('click', () => {
            this.closeModal('changePasswordModal');
        });

        document.getElementById('cancelPasswordBtn').addEventListener('click', () => {
            this.closeModal('changePasswordModal');
        });

        document.getElementById('changePasswordSubmitBtn').addEventListener('click', () => {
            this.changePassword();
        });

        // Success Modal
        document.getElementById('successOkBtn').addEventListener('click', () => {
            this.closeModal('successModal');
        });

        // Password Toggle
        document.querySelectorAll('.password-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.togglePassword(e.target.closest('.password-toggle'));
            });
        });

        // Password Validation
        document.getElementById('newPassword').addEventListener('input', (e) => {
            this.validatePassword(e.target.value);
        });

        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                e.target.classList.remove('active');
                this.hideError();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal-overlay.active');
                if (activeModal) {
                    activeModal.classList.remove('active');
                    this.hideError();
                }
            }
        });

        // Form validation on input
        document.querySelectorAll('input[required]').forEach(input => {
            input.addEventListener('input', () => {
                this.validateInput(input);
            });
        });
    }

    // ===== MODAL MANAGEMENT =====
    openEditProfileModal() {
        this.hideError();
        this.loadProfileToForm();
        document.getElementById('editProfileModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    openChangePasswordModal() {
        this.hideError();
        this.resetPasswordForm();
        document.getElementById('changePasswordModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        document.body.style.overflow = 'auto';
        this.hideError();
    }

    showSuccessModal(title, message) {
        document.getElementById('successTitle').textContent = title;
        document.getElementById('successMessage').textContent = message;
        document.getElementById('successModal').classList.add('active');
    }

    // ===== DATA MANAGEMENT =====
    loadProfileData() {
        // Simulate loading profile data
        const profileData = {
            fullName: 'Huỳnh Bảo Quyền',
            email: 'admin@tutorfinder.com',
            phone: '0935 130 945',
            role: 'Super Administrator',
            createdDate: '15/01/2024',
            lastLogin: 'Hôm nay - 14:30'
        };

        // Store in localStorage for persistence
        localStorage.setItem('adminProfile', JSON.stringify(profileData));
        this.updateDisplayInfo(profileData);
    }

    loadProfileToForm() {
        const profileData = JSON.parse(localStorage.getItem('adminProfile') || '{}');

        document.getElementById('fullName').value = profileData.fullName || '';
        document.getElementById('email').value = profileData.email || '';
        document.getElementById('phone').value = profileData.phone || '';
        document.getElementById('role').value = profileData.role || '';
    }

    updateDisplayInfo(data) {
        document.getElementById('displayName').textContent = data.fullName;
        document.getElementById('displayEmail').textContent = data.email;
        document.getElementById('displayPhone').textContent = data.phone;
    }

    // ===== PROFILE EDITING =====
    async saveProfile() {
        const form = document.getElementById('editProfileForm');
        const formData = new FormData(form);

        // Validate form
        if (!this.validateForm(form)) {
            this.showError('editErrorMessage', 'Vui lòng điền đầy đủ thông tin hợp lệ!');
            return;
        }

        // Show loading
        this.showLoading();

        try {
            // Simulate API call
            await this.delay(1500);

            // Update profile data
            const profileData = {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                role: formData.get('role'),
                createdDate: '15/01/2024',
                lastLogin: 'Hôm nay - 14:30'
            };

            localStorage.setItem('adminProfile', JSON.stringify(profileData));
            this.updateDisplayInfo(profileData);

            this.hideLoading();
            this.closeModal('editProfileModal');
            this.showSuccessModal(
                'Cập nhật thông tin thành công!',
                'Thông tin cá nhân của bạn đã được cập nhật thành công.'
            );

        } catch (error) {
            this.hideLoading();
            this.showError('editErrorMessage', 'Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại!');
        }
    }

    // ===== PASSWORD MANAGEMENT =====
    async changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showError('passwordErrorMessage', 'Vui lòng điền đầy đủ thông tin!');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showError('passwordErrorMessage', 'Mật khẩu xác nhận không khớp!');
            return;
        }

        // Check password requirements
        const isValid = this.checkPasswordRequirements(newPassword);
        if (!isValid) {
            this.showError('passwordErrorMessage', 'Mật khẩu mới không đáp ứng yêu cầu bảo mật!');
            return;
        }

        // Check current password (simulate)
        if (currentPassword.length < 6) {
            this.showError('passwordErrorMessage', 'Mật khẩu hiện tại không chính xác!');
            return;
        }

        // Show loading
        this.showLoading();

        try {
            // Simulate API call
            await this.delay(2000);

            this.hideLoading();
            this.closeModal('changePasswordModal');
            this.showSuccessModal(
                'Đổi mật khẩu thành công!',
                'Mật khẩu của bạn đã được thay đổi thành công. Vui lòng sử dụng mật khẩu mới cho lần đăng nhập tiếp theo.'
            );

        } catch (error) {
            this.hideLoading();
            this.showError('passwordErrorMessage', 'Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại!');
        }
    }

    resetPasswordForm() {
        document.getElementById('changePasswordForm').reset();
        this.resetPasswordRequirements();
        this.hideError();
    }

    // ===== PASSWORD VALIDATION =====
    validatePassword(password) {
        const requirements = {
            'length-req': password.length >= 8,
            'uppercase-req': /[A-Z]/.test(password),
            'lowercase-req': /[a-z]/.test(password),
            'number-req': /[0-9]/.test(password),
            'special-req': /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        Object.keys(requirements).forEach(req => {
            const element = document.getElementById(req);
            const icon = element.querySelector('i');

            if (requirements[req]) {
                element.classList.add('valid');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-check');
            } else {
                element.classList.remove('valid');
                icon.classList.remove('fa-check');
                icon.classList.add('fa-times');
            }
        });

        return Object.values(requirements).every(req => req);
    }

    checkPasswordRequirements(password) {
        const validElements = document.querySelectorAll('.password-requirements li.valid');
        return validElements.length === 5;
    }

    resetPasswordRequirements() {
        const requirements = ['length-req', 'uppercase-req', 'lowercase-req', 'number-req', 'special-req'];
        requirements.forEach(req => {
            const element = document.getElementById(req);
            element.classList.remove('valid');
            const icon = element.querySelector('i');
            icon.classList.remove('fa-check');
            icon.classList.add('fa-times');
        });
    }

    // ===== PASSWORD TOGGLE =====
    togglePassword(button) {
        const targetId = button.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const icon = button.querySelector('i');

        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    // ===== FORM VALIDATION =====
    validateForm(form) {
        const inputs = form.querySelectorAll('input[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateInput(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateInput(input) {
        const value = input.value.trim();
        let isValid = true;

        // Remove previous validation classes
        input.classList.remove('error', 'success');

        // Check if required field is empty
        if (input.hasAttribute('required') && !value) {
            isValid = false;
        }

        // Email validation
        if (input.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
            }
        }

        // Phone validation
        if (input.type === 'tel' && value) {
            const phoneRegex = /^[0-9\s\-\+\(\)]{10,15}$/;
            if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                isValid = false;
            }
        }

        // Add validation classes
        if (isValid) {
            input.classList.add('success');
        } else {
            input.classList.add('error');
        }

        return isValid;
    }

    // ===== ERROR HANDLING =====
    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.querySelector('span').textContent = message;
            errorElement.style.display = 'flex';
            errorElement.classList.add('show');

            // Auto hide after 5 seconds
            setTimeout(() => {
                this.hideError();
            }, 5000);
        }
    }

    hideError() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.style.display = 'none';
            element.classList.remove('show');
        });
    }

    // ===== LOADING =====
    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    // ===== UTILITIES =====
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ===== NOTIFICATION =====
    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to body
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Add close event
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.hideNotification(notification);
        });

        // Auto hide after 4 seconds
        setTimeout(() => {
            this.hideNotification(notification);
        }, 4000);
    }

    hideNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    // ===== DATA BACKUP =====
    exportProfileData() {
        const profileData = JSON.parse(localStorage.getItem('adminProfile') || '{}');
        const dataStr = JSON.stringify(profileData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'admin_profile_backup.json';
        link.click();

        this.showNotification('Dữ liệu profile đã được xuất thành công!');
    }

    // ===== SECURITY =====
    checkSecurityStatus() {
        const lastPasswordChange = localStorage.getItem('lastPasswordChange');
        const now = new Date().getTime();
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;

        if (!lastPasswordChange || (now - parseInt(lastPasswordChange)) > thirtyDays) {
            this.showNotification(
                'Bạn nên đổi mật khẩu định kỳ để đảm bảo bảo mật tài khoản!',
                'warning'
            );
        }
    }

    // ===== INITIALIZATION HELPERS =====
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + E: Edit Profile
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                this.openEditProfileModal();
            }

            // Ctrl/Cmd + P: Change Password
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                this.openChangePasswordModal();
            }
        });
    }

    // ===== AUTO SAVE =====
    setupAutoSave() {
        const inputs = document.querySelectorAll('#editProfileForm input[type="text"], #editProfileForm input[type="email"], #editProfileForm input[type="tel"]');

        inputs.forEach(input => {
            input.addEventListener('input', () => {
                clearTimeout(this.autoSaveTimeout);
                this.autoSaveTimeout = setTimeout(() => {
                    this.autoSaveProfile();
                }, 3000); // Auto save after 3 seconds of inactivity
            });
        });
    }

    autoSaveProfile() {
        const profileData = JSON.parse(localStorage.getItem('adminProfile') || '{}');
        const form = document.getElementById('editProfileForm');

        if (form && document.getElementById('editProfileModal').classList.contains('active')) {
            const formData = new FormData(form);
            profileData.autoSave = {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                timestamp: new Date().getTime()
            };

            localStorage.setItem('adminProfile', JSON.stringify(profileData));
        }
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function () {
    // Initialize Admin Profile Manager
    const adminProfile = new AdminProfile();

    // Setup additional features
    adminProfile.setupKeyboardShortcuts();
    adminProfile.setupAutoSave();

    // Check security status after 2 seconds
    setTimeout(() => {
        adminProfile.checkSecurityStatus();
    }, 2000);

    // Global functions for backward compatibility
    window.adminProfile = adminProfile;
    window.openEditProfileModal = () => adminProfile.openEditProfileModal();
    window.openChangePasswordModal = () => adminProfile.openChangePasswordModal();
    window.closeModal = (modalId) => adminProfile.closeModal(modalId);
    window.exportProfileData = () => adminProfile.exportProfileData();
});

// ===== ERROR HANDLING =====
window.addEventListener('error', function (e) {
    console.error('Admin Profile Error:', e.error);

    // Show user-friendly error message
    if (window.adminProfile) {
        window.adminProfile.showNotification(
            'Đã xảy ra lỗi không mong muốn. Vui lòng tải lại trang.',
            'error'
        );
    }
});

// ===== PERFORMANCE MONITORING =====
window.addEventListener('load', function () {
    const loadTime = performance.now();
    console.log(`Admin Profile loaded in ${loadTime.toFixed(2)}ms`);
});