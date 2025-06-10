// ===== SIMPLIFIED TUTOR PROFILE PAGE JAVASCRIPT =====
// File: js/tutor_profile_simplified.js

class SimplifiedTutorProfileManager {
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
        this.loadTutorData(); // Load data first
        this.bindEvents(); // Then bind events

        console.log('Simplified Tutor Profile Manager initialized for tutor:', this.tutorId);
    }

    getTutorIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        this.tutorId = urlParams.get('id') || 'tutor_1'; // Default for demo
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

    loadTutorData() {
        // Load data immediately for demo - no loading state
        this.tutorData = this.generateSampleTutorData();
        this.renderTutorProfile();
    }

    generateSampleTutorData() {
        const sampleData = {
            'tutor_1': {
                id: 'tutor_1',
                name: 'Thầy Nguyễn Văn Hùng',
                email: 'hungnv@example.com',
                phone: '0123456789',
                gender: 'Nam',
                experience: '5 năm kinh nghiệm',
                rating: 4.8,
                totalReviews: 25,
                subjects: 'Toán học',
                reviews: [
                    {
                        studentName: 'Nguyễn Minh An',
                        rating: 5,
                        comment: 'Thầy dạy rất dễ hiểu và kiên nhẫn. Em đã cải thiện rất nhiều sau khi học với thầy.',
                        date: '2024-01-15'
                    },
                    {
                        studentName: 'Trần Thị Bình',
                        rating: 4,
                        comment: 'Phương pháp giảng dạy của thầy rất hay, giúp em hiểu bài nhanh hơn.',
                        date: '2024-01-10'
                    },
                    {
                        studentName: 'Lê Văn Cường',
                        rating: 5,
                        comment: 'Thầy rất tận tâm và luôn sẵn sàng giải đáp thắc mắc của học sinh.',
                        date: '2024-01-05'
                    },
                    {
                        studentName: 'Phạm Thị Dung',
                        rating: 5,
                        comment: 'Cảm ơn thầy đã giúp em hiểu rõ các bài toán khó.',
                        date: '2024-01-03'
                    },
                    {
                        studentName: 'Hoàng Văn Nam',
                        rating: 4,
                        comment: 'Thầy giải thích rất chi tiết và dễ hiểu.',
                        date: '2024-01-01'
                    }
                ]
            },
            'tutor_2': {
                id: 'tutor_2',
                name: 'Cô Trần Thị Lan',
                email: 'lantt@example.com',
                phone: '0987654321',
                gender: 'Nữ',
                experience: '3 năm kinh nghiệm',
                rating: 4.6,
                totalReviews: 18,
                subjects: 'Toán học',
                reviews: [
                    {
                        studentName: 'Phạm Văn Đức',
                        rating: 5,
                        comment: 'Cô dạy rất vui và dễ hiểu.',
                        date: '2024-01-12'
                    },
                    {
                        studentName: 'Nguyễn Thị Em',
                        rating: 4,
                        comment: 'Cô rất kiên nhẫn với các em.',
                        date: '2024-01-08'
                    }
                ]
            },
            'tutor_3': {
                id: 'tutor_3',
                name: 'Thầy Lê Minh Tuấn',
                email: 'tuanlm@example.com',
                phone: '0901234567',
                gender: 'Nam',
                experience: '7 năm kinh nghiệm',
                rating: 4.9,
                totalReviews: 32,
                subjects: 'Hóa học, Sinh học',
                reviews: [
                    {
                        studentName: 'Hoàng Văn Giang',
                        rating: 5,
                        comment: 'Thầy giảng bài rất sinh động và dễ nhớ.',
                        date: '2024-01-20'
                    }
                ]
            }
        };

        return sampleData[this.tutorId] || sampleData['tutor_1'];
    }

    renderTutorProfile() {
        const data = this.tutorData;

        // Render header
        this.elements.tutorAvatar.innerHTML = `
            <div class="avatar-letter">${data.name.charAt(0)}</div>
        `;

        this.elements.tutorName.textContent = data.name;

        this.elements.tutorRating.innerHTML = `
            <div class="rating-stars">
                ${this.generateStarDisplay(data.rating)}
            </div>
            <span class="rating-text">${data.rating}/5 sao (${data.totalReviews} đánh giá)</span>
        `;

        // Render basic info
        this.renderBasicInfo();

        // Render recent reviews
        this.renderRecentReviews();
    }

    renderBasicInfo() {
        const data = this.tutorData;

        this.elements.basicInfoGrid.innerHTML = `
            <div class="info-item">
                <div class="info-label">
                    <i class="fas fa-envelope"></i>
                    Email
                </div>
                <div class="info-value">${data.email}</div>
            </div>
            <div class="info-item">
                <div class="info-label">
                    <i class="fas fa-phone"></i>
                    Số điện thoại
                </div>
                <div class="info-value">${data.phone}</div>
            </div>
            <div class="info-item">
                <div class="info-label">
                    <i class="fas fa-venus-mars"></i>
                    Giới tính
                </div>
                <div class="info-value">${data.gender}</div>
            </div>
            <div class="info-item">
                <div class="info-label">
                    <i class="fas fa-briefcase"></i>
                    Kinh nghiệm
                </div>
                <div class="info-value">${data.experience}</div>
            </div>
            <div class="info-item">
                <div class="info-label">
                    <i class="fas fa-book"></i>
                    Môn học chuyên môn
                </div>
                <div class="info-value">${data.subjects}</div>
            </div>
            <div class="info-item">
                <div class="info-label">
                    <i class="fas fa-star"></i>
                    Đánh giá
                </div>
                <div class="info-value">${data.rating}/5 sao (${data.totalReviews} lượt đánh giá)</div>
            </div>
        `;
    }

    renderRecentReviews() {
        const data = this.tutorData;
        const recentReviews = data.reviews.slice(0, 3); // Show only 3 recent reviews

        this.elements.recentReviewsList.innerHTML = recentReviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <div class="reviewer-info">
                        <div class="reviewer-avatar">
                            ${review.studentName.charAt(0)}
                        </div>
                        <div class="reviewer-name">${review.studentName}</div>
                    </div>
                    <div class="review-rating">
                        <div class="stars">
                            ${this.generateStarDisplay(review.rating)}
                        </div>
                        <div class="review-date">${this.formatDate(review.date)}</div>
                    </div>
                </div>
                <p class="review-comment">${review.comment}</p>
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

    submitQuickReview() {
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

        // Simulate API call
        setTimeout(() => {
            // Add review to data (simulate)
            const newReview = {
                studentName: 'Bạn',
                rating: this.currentQuickRating,
                comment: comment,
                date: new Date().toISOString().split('T')[0]
            };

            this.tutorData.reviews.unshift(newReview);
            this.tutorData.totalReviews++;

            // Recalculate average rating
            const totalRating = this.tutorData.reviews.reduce((sum, review) => sum + review.rating, 0);
            this.tutorData.rating = (totalRating / this.tutorData.reviews.length).toFixed(1);

            // Update display
            this.renderTutorProfile();
            this.resetQuickReviewForm();

            this.showNotification('Đánh giá đã được gửi thành công!', 'success');

            // Reset button
            this.elements.submitQuickReview.disabled = false;
            this.elements.submitQuickReview.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi đánh giá';
        }, 2000);
    }

    resetQuickReviewForm() {
        this.currentQuickRating = 0;
        this.updateQuickStarDisplay();
        this.elements.quickRatingText.textContent = ''; // Bỏ text "Chọn số sao"
        this.elements.quickComment.value = '';
    }

    // ===== MODAL FUNCTIONS =====
    openChat() {
        // Open chat with tutor
        window.open(`chat.html?user=${this.tutorId}`, '_blank');
    }
    showAllReviewsModal() {
        const data = this.tutorData;

        this.elements.allReviewsContent.innerHTML = `
            <div class="reviews-summary">
                <div class="overall-rating">
                    <div class="rating-number">${data.rating}</div>
                    <div class="rating-info">
                        <div class="stars">
                            ${this.generateStarDisplay(data.rating)}
                        </div>
                        <div class="rating-text">Dựa trên ${data.totalReviews} đánh giá</div>
                    </div>
                </div>
            </div>
            <div class="all-reviews-list">
                ${data.reviews.map(review => `
                    <div class="review-item">
                        <div class="review-header">
                            <div class="reviewer-info">
                                <div class="reviewer-avatar">
                                    ${review.studentName.charAt(0)}
                                </div>
                                <div class="reviewer-name">${review.studentName}</div>
                            </div>
                            <div class="review-rating">
                                <div class="stars">
                                    ${this.generateStarDisplay(review.rating)}
                                </div>
                                <div class="review-date">${this.formatDate(review.date)}</div>
                            </div>
                        </div>
                        <p class="review-comment">${review.comment}</p>
                    </div>
                `).join('')}
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
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i - 0.5 <= rating) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    showLoading() {
        document.body.classList.add('loading');
    }

    hideLoading() {
        document.body.classList.remove('loading');
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
let simplifiedTutorProfileManager;

document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('tutor-profile-page')) {
        simplifiedTutorProfileManager = new SimplifiedTutorProfileManager();
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
`;
document.head.appendChild(style);