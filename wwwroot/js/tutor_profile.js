// ===== TUTOR PROFILE PAGE JAVASCRIPT - DATABASE VERSION =====
// File: js/tutor_profile.js

class TutorProfileManager {
    constructor() {
        this.tutorId = null;
        this.tutorData = null;
        this.currentQuickRating = 0;

        // Elements
        this.elements = {
            tutorAvatar: document.getElementById('tutorAvatar'),
            tutorName: document.getElementById('tutorName'),
            tutorRating: document.getElementById('tutorRating'),

            // Action buttons
            messageBtn: document.getElementById('messageBtn'),

            // Basic info
            basicInfoGrid: document.getElementById('basicInfoGrid'),

            // Quick review
            quickStarRating: document.getElementById('quickStarRating'),
            quickRatingText: document.getElementById('quickRatingText'),
            quickComment: document.getElementById('quickComment'),
            submitQuickReview: document.getElementById('submitQuickReview'),

            // Recent reviews
            recentReviewsList: document.getElementById('recentReviewsList'),
            viewAllReviewsBtn: document.getElementById('viewAllReviewsBtn'),

            // Modals
            allReviewsModal: document.getElementById('allReviewsModal'),
            closeAllReviewsModal: document.getElementById('closeAllReviewsModal'),
            allReviewsContent: document.getElementById('allReviewsContent')
        };

        this.init();
    }

    init() {
        this.getTutorIdFromURL();
        this.loadTutorData(); // Load data from database
        this.bindEvents();

        console.log('Tutor Profile Manager initialized for tutor:', this.tutorId);
    }

    getTutorIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        this.tutorId = urlParams.get('id');

        if (!this.tutorId) {
            this.showNotification('Không tìm thấy ID gia sư', 'error');
            // Có thể redirect về trang danh sách gia sư
            // window.location.href = 'tutor_list.html';
            return;
        }
    }

    bindEvents() {
        // Message button
        if (this.elements.messageBtn) {
            this.elements.messageBtn.addEventListener('click', () => this.openChat());
        }

        // Quick review star rating
        if (this.elements.quickStarRating) {
            const stars = this.elements.quickStarRating.querySelectorAll('i');
            stars.forEach((star, index) => {
                star.addEventListener('click', () => this.setQuickRating(index + 1));
                star.addEventListener('mouseenter', () => this.highlightQuickStars(index + 1));
            });

            this.elements.quickStarRating.addEventListener('mouseleave', () => this.resetQuickStarHighlight());
        }

        // Submit quick review
        if (this.elements.submitQuickReview) {
            this.elements.submitQuickReview.addEventListener('click', () => this.submitQuickReview());
        }

        // View all reviews
        if (this.elements.viewAllReviewsBtn) {
            this.elements.viewAllReviewsBtn.addEventListener('click', () => this.showAllReviewsModal());
        }

        // Modal close events
        if (this.elements.closeAllReviewsModal) {
            this.elements.closeAllReviewsModal.addEventListener('click', () => this.closeModal('allReviewsModal'));
        }

        // Close modal on overlay click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeAllModals();
            }
        });

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    async loadTutorData() {
        this.showLoading();

        try {
            // Gọi API để lấy thông tin gia sư
            const tutorResponse = await fetch(`/api/tutors/${this.tutorId}`);

            if (!tutorResponse.ok) {
                throw new Error('Không tìm thấy thông tin gia sư');
            }

            this.tutorData = await tutorResponse.json();

            // Gọi API để lấy đánh giá của gia sư
            await this.loadTutorReviews();

            // Render giao diện
            this.renderTutorProfile();

        } catch (error) {
            console.error('Lỗi khi tải thông tin gia sư:', error);
            this.showError('Không thể tải thông tin gia sư. Vui lòng thử lại sau.');
        } finally {
            this.hideLoading();
        }
    }

    async loadTutorReviews() {
        try {
            const reviewsResponse = await fetch(`/api/tutors/${this.tutorId}/reviews`);

            if (reviewsResponse.ok) {
                const reviews = await reviewsResponse.json();
                this.tutorData.reviews = reviews;
                this.tutorData.totalReviews = reviews.length;

                // Tính điểm đánh giá trung bình
                if (reviews.length > 0) {
                    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
                    this.tutorData.averageRating = (totalRating / reviews.length).toFixed(1);
                } else {
                    this.tutorData.averageRating = 0;
                }
            } else {
                this.tutorData.reviews = [];
                this.tutorData.totalReviews = 0;
                this.tutorData.averageRating = 0;
            }
        } catch (error) {
            console.error('Lỗi khi tải đánh giá:', error);
            this.tutorData.reviews = [];
            this.tutorData.totalReviews = 0;
            this.tutorData.averageRating = 0;
        }
    }

    renderTutorProfile() {
        if (!this.tutorData) return;

        // Render header
        this.renderHeader();

        // Render basic info
        this.renderBasicInfo();

        // Render recent reviews
        this.renderRecentReviews();
    }

    renderHeader() {
        const data = this.tutorData;

        // Avatar - sử dụng ảnh từ database hoặc tạo avatar từ chữ cái đầu
        if (data.profileImage) {
            this.elements.tutorAvatar.innerHTML = `
                <img src="${data.profileImage}" alt="${data.name}" class="avatar-image">
            `;
        } else {
            this.elements.tutorAvatar.innerHTML = `
                <div class="avatar-letter">${data.name ? data.name.charAt(0) : 'T'}</div>
            `;
        }

        // Tên gia sư
        this.elements.tutorName.textContent = data.name || 'Chưa có tên';

        // Đánh giá
        this.elements.tutorRating.innerHTML = `
            <div class="rating-stars">
                ${this.generateStarDisplay(data.averageRating || 0)}
            </div>
            <span class="rating-text">${data.averageRating || 0}/5 sao (${data.totalReviews || 0} đánh giá)</span>
        `;
    }

    renderBasicInfo() {
        const data = this.tutorData;

        this.elements.basicInfoGrid.innerHTML = `
            <div class="info-item">
                <div class="info-label">
                    <i class="fas fa-envelope"></i>
                    Email
                </div>
                <div class="info-value">${data.email || 'Chưa có email'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">
                    <i class="fas fa-phone"></i>
                    Số điện thoại
                </div>
                <div class="info-value">${data.phone || 'Chưa có số điện thoại'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">
                    <i class="fas fa-venus-mars"></i>
                    Giới tính
                </div>
                <div class="info-value">${this.getGenderText(data.gender)}</div>
            </div>
            <div class="info-item">
                <div class="info-label">
                    <i class="fas fa-calendar"></i>
                    Ngày sinh
                </div>
                <div class="info-value">${data.dateOfBirth ? this.formatDate(data.dateOfBirth) : 'Chưa có thông tin'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">
                    <i class="fas fa-map-marker-alt"></i>
                    Địa chỉ
                </div>
                <div class="info-value">${data.address || 'Chưa có địa chỉ'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">
                    <i class="fas fa-briefcase"></i>
                    Kinh nghiệm
                </div>
                <div class="info-value">${data.experience || 'Chưa có thông tin'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">
                    <i class="fas fa-graduation-cap"></i>
                    Trình độ học vấn
                </div>
                <div class="info-value">${data.education || 'Chưa có thông tin'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">
                    <i class="fas fa-book"></i>
                    Môn học chuyên môn
                </div>
                <div class="info-value">${this.getSubjectsText(data.subjects) || 'Chưa có thông tin'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">
                    <i class="fas fa-star"></i>
                    Đánh giá
                </div>
                <div class="info-value">${data.averageRating || 0}/5 sao (${data.totalReviews || 0} lượt đánh giá)</div>
            </div>
            ${data.description ? `
            <div class="info-item full-width">
                <div class="info-label">
                    <i class="fas fa-info-circle"></i>
                    Giới thiệu
                </div>
                <div class="info-value description">${data.description}</div>
            </div>
            ` : ''}
        `;
    }

    renderRecentReviews() {
        const reviews = this.tutorData.reviews || [];
        const recentReviews = reviews.slice(0, 3); // Hiển thị 3 đánh giá gần nhất

        if (recentReviews.length === 0) {
            this.elements.recentReviewsList.innerHTML = `
                <div class="no-reviews">
                    <i class="fas fa-comment-slash"></i>
                    <p>Chưa có đánh giá nào</p>
                </div>
            `;
            return;
        }

        this.elements.recentReviewsList.innerHTML = recentReviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <div class="reviewer-info">
                        <div class="reviewer-avatar">
                            ${review.studentName ? review.studentName.charAt(0) : 'S'}
                        </div>
                        <div class="reviewer-name">${review.studentName || 'Học viên'}</div>
                    </div>
                    <div class="review-rating">
                        <div class="stars">
                            ${this.generateStarDisplay(review.rating)}
                        </div>
                        <div class="review-date">${this.formatDate(review.createdAt || review.date)}</div>
                    </div>
                </div>
                <p class="review-comment">${review.comment || 'Không có nhận xét'}</p>
            </div>
        `).join('');
    }

    // ===== QUICK REVIEW FUNCTIONS =====
    setQuickRating(rating) {
        this.currentQuickRating = rating;
        this.updateQuickStarDisplay();
        this.elements.quickRatingText.textContent = `${rating} sao`;
    }

    highlightQuickStars(rating) {
        const stars = this.elements.quickStarRating.querySelectorAll('i');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.style.color = '#ffc107';
            } else {
                star.style.color = '#ddd';
            }
        });
    }

    resetQuickStarHighlight() {
        this.updateQuickStarDisplay();
    }

    updateQuickStarDisplay() {
        const stars = this.elements.quickStarRating.querySelectorAll('i');
        stars.forEach((star, index) => {
            if (index < this.currentQuickRating) {
                star.style.color = '#ffc107';
                star.classList.add('active');
            } else {
                star.style.color = '#ddd';
                star.classList.remove('active');
            }
        });
    }

    async submitQuickReview() {
        // Kiểm tra đăng nhập
        const token = localStorage.getItem('token');
        if (!token) {
            this.showNotification('Vui lòng đăng nhập để đánh giá', 'warning');
            return;
        }

        if (!this.currentQuickRating) {
            this.showNotification('Vui lòng chọn số sao đánh giá', 'warning');
            return;
        }

        const comment = this.elements.quickComment.value.trim();
        if (!comment) {
            this.showNotification('Vui lòng nhập nhận xét', 'warning');
            return;
        }

        // Disable button and show loading
        this.elements.submitQuickReview.disabled = true;
        this.elements.submitQuickReview.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';

        try {
            const reviewData = {
                tutorId: this.tutorId,
                rating: this.currentQuickRating,
                comment: comment
            };

            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(reviewData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Lỗi khi gửi đánh giá');
            }

            // Reload reviews và cập nhật giao diện
            await this.loadTutorReviews();
            this.renderTutorProfile();
            this.resetQuickReviewForm();

            this.showNotification('Đánh giá đã được gửi thành công!', 'success');

        } catch (error) {
            console.error('Lỗi khi gửi đánh giá:', error);
            this.showNotification(error.message || 'Có lỗi xảy ra khi gửi đánh giá', 'error');
        } finally {
            // Reset button
            this.elements.submitQuickReview.disabled = false;
            this.elements.submitQuickReview.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi đánh giá';
        }
    }

    resetQuickReviewForm() {
        this.currentQuickRating = 0;
        this.updateQuickStarDisplay();
        this.elements.quickRatingText.textContent = '';
        this.elements.quickComment.value = '';
    }

    // ===== MODAL FUNCTIONS =====
    openChat() {
        // Mở chat với gia sư
        window.open(`chat.html?user=${this.tutorId}`, '_blank');
    }

    showAllReviewsModal() {
        const data = this.tutorData;
        const reviews = data.reviews || [];

        this.elements.allReviewsContent.innerHTML = `
            <div class="reviews-summary">
                <div class="overall-rating">
                    <div class="rating-number">${data.averageRating || 0}</div>
                    <div class="rating-info">
                        <div class="stars">
                            ${this.generateStarDisplay(data.averageRating || 0)}
                        </div>
                        <div class="rating-text">Dựa trên ${data.totalReviews || 0} đánh giá</div>
                    </div>
                </div>
            </div>
            <div class="all-reviews-list">
                ${reviews.length > 0 ? reviews.map(review => `
                    <div class="review-item">
                        <div class="review-header">
                            <div class="reviewer-info">
                                <div class="reviewer-avatar">
                                    ${review.studentName ? review.studentName.charAt(0) : 'S'}
                                </div>
                                <div class="reviewer-name">${review.studentName || 'Học viên'}</div>
                            </div>
                            <div class="review-rating">
                                <div class="stars">
                                    ${this.generateStarDisplay(review.rating)}
                                </div>
                                <div class="review-date">${this.formatDate(review.createdAt || review.date)}</div>
                            </div>
                        </div>
                        <p class="review-comment">${review.comment || 'Không có nhận xét'}</p>
                    </div>
                `).join('') : `
                    <div class="no-reviews">
                        <i class="fas fa-comment-slash"></i>
                        <p>Chưa có đánh giá nào</p>
                    </div>
                `}
            </div>
        `;

        this.showModal('allReviewsModal');
    }

    showModal(modalId) {
        const modal = this.elements[modalId];
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = this.elements[modalId];
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    closeAllModals() {
        Object.keys(this.elements).forEach(key => {
            if (key.includes('Modal')) {
                this.closeModal(key);
            }
        });
    }

    // ===== UTILITY FUNCTIONS =====
    generateStarDisplay(rating) {
        let stars = '';
        const numRating = parseFloat(rating);

        for (let i = 1; i <= 5; i++) {
            if (i <= numRating) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i - 0.5 <= numRating) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    }

    formatDate(dateString) {
        if (!dateString) return 'Chưa có thông tin';

        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    getGenderText(gender) {
        const genderMap = {
            'male': 'Nam',
            'female': 'Nữ',
            'other': 'Khác'
        };
        return genderMap[gender] || 'Chưa có thông tin';
    }

    getSubjectsText(subjects) {
        if (Array.isArray(subjects)) {
            return subjects.join(', ');
        }
        return subjects || 'Chưa có thông tin';
    }

    showLoading() {
        // Hiển thị loading state
        if (this.elements.basicInfoGrid) {
            this.elements.basicInfoGrid.innerHTML = `
                <div class="loading-state">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Đang tải thông tin...</p>
                </div>
            `;
        }
    }

    hideLoading() {
        // Loading sẽ được ẩn khi render xong
    }

    showError(message) {
        if (this.elements.basicInfoGrid) {
            this.elements.basicInfoGrid.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="retry-btn">
                        <i class="fas fa-redo"></i>
                        Thử lại
                    </button>
                </div>
            `;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'notification ' + type;
        notification.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>${message}</span>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: ${type === 'warning' ? '#333' : 'white'};
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10001;
            display: flex;
            align-items: center;
            gap: 0.8rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInFromRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// ===== INITIALIZATION =====
let tutorProfileManager;

document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('tutor-profile-page')) {
        tutorProfileManager = new TutorProfileManager();
    }
});

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInFromRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .loading-state, .error-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 3rem;
        color: #666;
    }

    .loading-state i, .error-state i {
        font-size: 2rem;
        margin-bottom: 1rem;
        color: #0eb582;
    }

    .error-state i {
        color: #dc3545;
    }

    .retry-btn {
        background: #0eb582;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 1rem;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
    }

    .retry-btn:hover {
        background: #0a9168;
    }

    .no-reviews {
        text-align: center;
        padding: 3rem;
        color: #666;
    }

    .no-reviews i {
        font-size: 3rem;
        margin-bottom: 1rem;
        color: #ddd;
    }

    .info-item.full-width {
        grid-column: 1 / -1;
    }

    .info-value.description {
        line-height: 1.6;
        margin-top: 0.5rem;
    }

    .avatar-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
    }
`;
document.head.appendChild(style);