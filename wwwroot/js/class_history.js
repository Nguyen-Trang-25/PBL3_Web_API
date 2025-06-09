 

// ===== CLASS HISTORY PAGE JAVASCRIPT - UPDATED =====
// File: js/class_history.js

class ClassHistoryManager {
    constructor() {
        this.currentUserRole = 'student'; // Default role, will be detected
        this.currentUserId = 'user_123'; // Will be from session
        this.classes = [];
        this.filteredClasses = [];
        this.currentFilters = {
            status: '',
            subject: '',
            date: ''
        };
        this.selectedTutorForConfirm = null;
        this.selectedClassForConfirm = null;
        this.classToCancel = null;

        // Elements
        this.elements = {
            userRoleSubtitle: document.getElementById('userRoleSubtitle'),
            statusFilter: document.getElementById('statusFilter'),
            subjectFilter: document.getElementById('subjectFilter'),
            dateFilter: document.getElementById('dateFilter'),
            refreshBtn: document.getElementById('refreshBtn'),
            statsContainer: document.getElementById('statsContainer'),
            classesGrid: document.getElementById('classesGrid'),
            emptyState: document.getElementById('emptyState'),

            // Modals
            classDetailModal: document.getElementById('classDetailModal'),
            applicationsModal: document.getElementById('applicationsModal'),
            reviewModal: document.getElementById('reviewModal'),
            confirmSelectTutorModal: document.getElementById('confirmSelectTutorModal'),
            cancelClassModal: document.getElementById('cancelClassModal'),

            // Modal close buttons
            closeDetailModal: document.getElementById('closeDetailModal'),
            closeApplicationsModal: document.getElementById('closeApplicationsModal'),
            closeReviewModal: document.getElementById('closeReviewModal'),
            closeConfirmSelectModal: document.getElementById('closeConfirmSelectModal'),
            closeCancelClassModal: document.getElementById('closeCancelClassModal'),

            // Modal content
            modalTitle: document.getElementById('modalTitle'),
            modalBody: document.getElementById('modalBody'),
            applicationsBody: document.getElementById('applicationsBody'),

            // Confirm select tutor elements
            selectedTutorInfo: document.getElementById('selectedTutorInfo'),
            classSummaryContent: document.getElementById('classSummaryContent'),
            startDate: document.getElementById('startDate'),
            confirmAgreement: document.getElementById('confirmAgreement'),
            cancelSelectTutor: document.getElementById('cancelSelectTutor'),
            confirmSelectTutor: document.getElementById('confirmSelectTutor'),

            // Cancel class elements
            cancelReason: document.getElementById('cancelReason'),
            cancelNote: document.getElementById('cancelNote'),
            cancelCancelClass: document.getElementById('cancelCancelClass'),
            confirmCancelClass: document.getElementById('confirmCancelClass'),

            // Review form
            reviewForm: document.getElementById('reviewForm'),
            reviewTutorInfo: document.getElementById('reviewTutorInfo'),
            starRating: document.getElementById('starRating'),
            ratingText: document.getElementById('ratingText'),
            reviewComment: document.getElementById('reviewComment'),
            cancelReview: document.getElementById('cancelReview')
        };

        this.init();
    }

    init() {
        this.detectUserRole();
        this.bindEvents();
        this.loadClassData();
        this.updateSubtitle();

        console.log('Class History Manager initialized');
    }

    // ===== USER ROLE DETECTION =====
    detectUserRole() {
        // Try to get from localStorage or sessionStorage
        const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');

        if (userRole) {
            this.currentUserRole = userRole;
        } else {
            // Try to detect from body classes or URL
            const bodyClasses = document.body.className;

            if (bodyClasses.includes('tutor')) {
                this.currentUserRole = 'tutor';
            } else if (bodyClasses.includes('student')) {
                this.currentUserRole = 'student';
            } else if (bodyClasses.includes('parent')) {
                this.currentUserRole = 'parent';
            }
        }

        console.log('Detected user role:', this.currentUserRole);
    }

    updateSubtitle() {
        if (!this.elements.userRoleSubtitle) return;

        const subtitles = {
            student: 'Quản lý các yêu cầu tìm gia sư và theo dõi tình trạng học tập',
            tutor: 'Theo dõi các lớp đã ứng tuyển và lớp đang giảng dạy',
            parent: 'Quản lý việc học của con em và theo dõi tiến độ'
        };

        this.elements.userRoleSubtitle.textContent = subtitles[this.currentUserRole] || subtitles.student;
    }

    // ===== EVENT BINDING =====
    bindEvents() {
        // Filter events
        if (this.elements.statusFilter) {
            this.elements.statusFilter.addEventListener('change', () => this.applyFilters());
        }

        if (this.elements.subjectFilter) {
            this.elements.subjectFilter.addEventListener('change', () => this.applyFilters());
        }

        if (this.elements.dateFilter) {
            this.elements.dateFilter.addEventListener('change', () => this.applyFilters());
        }

        if (this.elements.refreshBtn) {
            this.elements.refreshBtn.addEventListener('click', () => this.refreshData());
        }

        // Modal close events
        if (this.elements.closeDetailModal) {
            this.elements.closeDetailModal.addEventListener('click', () => this.closeModal('classDetailModal'));
        }

        if (this.elements.closeApplicationsModal) {
            this.elements.closeApplicationsModal.addEventListener('click', () => this.closeModal('applicationsModal'));
        }

        if (this.elements.closeReviewModal) {
            this.elements.closeReviewModal.addEventListener('click', () => this.closeModal('reviewModal'));
        }

        if (this.elements.closeConfirmSelectModal) {
            this.elements.closeConfirmSelectModal.addEventListener('click', () => this.closeModal('confirmSelectTutorModal'));
        }

        if (this.elements.closeCancelClassModal) {
            this.elements.closeCancelClassModal.addEventListener('click', () => this.closeModal('cancelClassModal'));
        }

        // Confirm select tutor events
        if (this.elements.cancelSelectTutor) {
            this.elements.cancelSelectTutor.addEventListener('click', () => this.closeModal('confirmSelectTutorModal'));
        }

        if (this.elements.confirmSelectTutor) {
            this.elements.confirmSelectTutor.addEventListener('click', () => this.handleConfirmSelectTutor());
        }

        // Cancel class events
        if (this.elements.cancelCancelClass) {
            this.elements.cancelCancelClass.addEventListener('click', () => this.closeModal('cancelClassModal'));
        }

        if (this.elements.confirmCancelClass) {
            this.elements.confirmCancelClass.addEventListener('click', () => this.handleConfirmCancelClass());
        }

        // Close modal on overlay click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('class-history-modal-overlay')) {
                this.closeAllModals();
            }
        });

        // Review form events
        this.bindReviewFormEvents();

        // ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    bindReviewFormEvents() {
        // Star rating
        if (this.elements.starRating) {
            const stars = this.elements.starRating.querySelectorAll('i');
            stars.forEach((star, index) => {
                star.addEventListener('click', () => this.setRating(index + 1));
                star.addEventListener('mouseenter', () => this.highlightStars(index + 1));
            });

            this.elements.starRating.addEventListener('mouseleave', () => this.resetStarHighlight());
        }

        // Review form submission
        if (this.elements.reviewForm) {
            this.elements.reviewForm.addEventListener('submit', (e) => this.submitReview(e));
        }

        if (this.elements.cancelReview) {
            this.elements.cancelReview.addEventListener('click', () => this.closeModal('reviewModal'));
        }
    }

    // ===== DATA LOADING =====
    async loadClassData() {
        this.showLoading();

        this.classes = await this.loadHistoryRequest();
        this.filteredClasses = [...this.classes];
        console.log(this.filteredClasses);
        this.renderStats();
        this.renderClasses();

        this.hideLoading();
    }


    async loadHistoryRequest() {
        const token = localStorage.getItem('token');
        console.log(JSON.parse(atob(token.split('.')[1])));  // Xem payload

        if (!token) {
            console.warn('Vui lòng đăng nhập để xem lịch sử lớp học.');
            return [];
        }

        try {
            const response = await fetch('/api/request/historyRequest', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Lỗi khi tải dữ liệu lớp học');
            }

            const data = await response.json();
            console.log(data)
            return Array.isArray(data) ? data : [];

        } catch (error) {
            console.error('Lỗi khi tải dữ liệu lớp học:', error);
            return [];
        }
    }


    // ===== FILTERING =====
    applyFilters() {
        this.currentFilters = {
            status: this.elements.statusFilter?.value || '',
            subject: this.elements.subjectFilter?.value || '',
            date: this.elements.dateFilter?.value || ''
        };

        this.filteredClasses = this.classes.filter(classItem => {
            let matches = true;

            // Status filter
            if (this.currentFilters.status && classItem.status !== this.currentFilters.status) {
                matches = false;
            }

            // Subject filter
            if (this.currentFilters.subject && classItem.subject !== this.currentFilters.subject) {
                matches = false;
            }

            // Date filter
            if (this.currentFilters.date) {
                const classDate = this.currentUserRole === 'student' ? classItem.createdAt : classItem.appliedAt;
                if (!this.matchesDateFilter(classDate, this.currentFilters.date)) {
                    matches = false;
                }
            }

            return matches;
        });

        this.renderClasses();
        this.renderStats();
    }

    matchesDateFilter(date, filter) {
        const now = new Date();
        const classDate = new Date(date);

        switch (filter) {
            case 'this_week':
                const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
                return classDate >= weekStart;
            case 'this_month':
                return classDate.getMonth() === now.getMonth() && classDate.getFullYear() === now.getFullYear();
            case 'last_month':
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                return classDate >= lastMonth && classDate < thisMonth;
            case 'this_year':
                return classDate.getFullYear() === now.getFullYear();
            default:
                return true;
        }
    }

    // ===== RENDERING =====
    renderStats() {
        if (!this.elements.statsContainer) return;

        const stats = this.calculateStats();

        this.elements.statsContainer.innerHTML = `
            <div class="class-history-stat-card">
                <i class="class-history-stat-icon fas fa-clipboard-list"></i>
                <div class="class-history-stat-number">${stats.total}</div>
                <div class="class-history-stat-label">Tổng số lớp</div>
            </div>
            <div class="class-history-stat-card">
                <i class="class-history-stat-icon fas fa-clock"></i>
                <div class="class-history-stat-number">${stats.pending}</div>
                <div class="class-history-stat-label">Chưa có gia sư</div>
            </div>
            <div class="class-history-stat-card">
                <i class="class-history-stat-icon fas fa-check-circle"></i>
                <div class="class-history-stat-number">${stats.active}</div>
                <div class="class-history-stat-label">Đang dạy và học</div>
            </div>
            <div class="class-history-stat-card">
                <i class="class-history-stat-icon fas fa-graduation-cap"></i>
                <div class="class-history-stat-number">${stats.completed}</div>
                <div class="class-history-stat-label">Hoàn thành</div>
            </div>
        `;
    }

    calculateStats() {
        const stats = {
            total: this.filteredClasses.length,
            pending: 0,
            active: 0,
            completed: 0,
            cancelled: 0
        };

        this.filteredClasses.forEach(classItem => {
            switch (classItem.status) {
                case 'no_applications':
                    stats.pending++;
                    break;
                case 'pending':
                    stats.pending++;
                    break;
                case 'active':
                    stats.active++;
                    break;
                case 'completed':
                    stats.completed++;
                    break;
            }
        });

        return stats;
    }

    renderClasses() {
        if (!this.elements.classesGrid) return;

        if (this.filteredClasses.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();

        this.elements.classesGrid.innerHTML = this.filteredClasses
            .map(classItem => this.createClassCard(classItem))
            .join('');

        // Bind card events
        this.bindCardEvents();
    }

    createClassCard(classItem) {
        const statusConfig = this.getStatusConfig(classItem.status);
        const subjectIcon = this.getSubjectIcon(classItem.subject);

        if (this.currentUserRole === 'student') {
            return this.createStudentClassCard(classItem, statusConfig, subjectIcon);
        } else {
            return this.createTutorClassCard(classItem, statusConfig, subjectIcon);
        }
    }

    createStudentClassCard(classItem, statusConfig, subjectIcon) {
        const applicationsSection = classItem.applicationsCount > 0 ? `
            <div class="class-history-applications-count">
                <div class="class-history-count-number">${classItem.applicationsCount}</div>
                <div class="class-history-count-text">gia sư ứng tuyển</div>
            </div>
        ` : '';

        const actionButtons = this.getStudentActionButtons(classItem);

        return `
            <div class="class-history-card" data-class-id="${classItem.requestId}">
                <div class="class-history-card-header">
                    <div class="class-history-status-badge ${statusConfig.class}">
                        ${statusConfig.text}
                    </div>
                    <div class="class-history-subject-badge">
                        <i class="fas ${subjectIcon}"></i>
                        ${classItem.subjectName}
                    </div>
                    <h3 class="class-history-card-title">
                        ${classItem.subjectName} - ${classItem.level}
                    </h3>
                    <div class="class-history-card-info">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Đăng ngày ${this.formatDate(classItem.createdAt)}</span>
                    </div>
                </div>
                <div class="class-history-card-body">
                    <div class="class-history-info-grid">
                        <div class="class-history-info-item">
                            <div class="class-history-info-label">Học phí</div>
                            <div class="class-history-info-value">${classItem.fee}</div>
                        </div>
                        <div class="class-history-info-item">
                            <div class="class-history-info-label">Lịch học</div>
                            <div class="class-history-info-value">${classItem.schedule}</div>
                        </div>
                        <div class="class-history-info-item">
                            <div class="class-history-info-label">Địa điểm</div>
                            <div class="class-history-info-value">${classItem.location}</div>
                        </div>
                        <div class="class-history-info-item">
                            <div class="class-history-info-label">Trạng thái</div>
                            <div class="class-history-info-value">${statusConfig.text}</div>
                        </div>
                    </div>
                    ${applicationsSection}
                </div>
                <div class="class-history-card-footer">
                    ${actionButtons}
                </div>
            </div>
        `;
    }

    createTutorClassCard(classItem, statusConfig, subjectIcon) {
        const studentInfo = classItem.student ? `
            <div class="class-history-info-item">
                <div class="class-history-info-label">Học viên</div>
                <div class="class-history-info-value">${classItem.student.name}</div>
            </div>
            <div class="class-history-info-item">
                <div class="class-history-info-label">Liên hệ</div>
                <div class="class-history-info-value">${classItem.student.phone}</div>
            </div>
        ` : '';

        const actionButtons = this.getTutorActionButtons(classItem);

        return `
            <div class="class-history-card" data-class-id="${classItem.requestId}">
                <div class="class-history-card-header">
                    <div class="class-history-status-badge ${statusConfig.class}">
                        ${statusConfig.text}
                    </div>
                    <div class="class-history-subject-badge">
                        <i class="fas ${subjectIcon}"></i>
                        ${classItem.subjectName}
                    </div>
                    <h3 class="class-history-card-title">
                        ${classItem.subjectName} - ${classItem.level}
                    </h3>
                    <div class="class-history-card-info">
                        <i class="fas fa-paper-plane"></i>
                        <span>Ứng tuyển ngày ${this.formatDate(classItem.appliedAt)}</span>
                    </div>
                </div>
                <div class="class-history-card-body">
                    <div class="class-history-info-grid">
                        <div class="class-history-info-item">
                            <div class="class-history-info-label">Học phí</div>
                            <div class="class-history-info-value">${classItem.fee}</div>
                        </div>
                        <div class="class-history-info-item">
                            <div class="class-history-info-label">Lịch học</div>
                            <div class="class-history-info-value">${classItem.schedule}</div>
                        </div>
                        <div class="class-history-info-item">
                            <div class="class-history-info-label">Địa điểm</div>
                            <div class="class-history-info-value">${classItem.location}</div>
                        </div>
                        <div class="class-history-info-item">
                            <div class="class-history-info-label">Trạng thái</div>
                            <div class="class-history-info-value">${statusConfig.text}</div>
                        </div>
                        ${studentInfo}
                    </div>
                </div>
                <div class="class-history-card-footer">
                    ${actionButtons}
                </div>
            </div>
        `;
    }

    getStudentActionButtons(classItem) {
        let buttons = [];

        // Always show detail button
        buttons.push(`
            <button class="class-history-btn secondary" onclick="classHistoryManager.showClassDetail('${classItem.requestId}')">
                <i class="fas fa-eye"></i>
                Xem chi tiết
            </button>
        `);

        // Show applications if any
        if (classItem.applicationsCount > 0) {
            buttons.push(`
                <button class="class-history-btn primary" onclick="classHistoryManager.showApplications('${classItem.requestId}')">
                    <i class="fas fa-users"></i>
                    Xem ứng viên (${classItem.applicationsCount})
                </button>
            `);
        }

        // Show review if not reviewed yet and completed
        if (!classItem.hasReviewed && classItem.status === 'completed' && classItem.selectedTutor) {
            buttons.push(`
                <button class="class-history-btn warning" onclick="classHistoryManager.showReviewForm('${classItem.requestId}')">
                    <i class="fas fa-star"></i>
                    Đánh giá
                </button>
            `);
        }

        // Always show cancel button (except for completed and cancelled classes)
        if (classItem.status !== 'completed' && classItem.status !== 'cancelled') {
            buttons.push(`
                <button class="class-history-btn danger" onclick="classHistoryManager.showCancelClassModal('${classItem.requestId}')">
                    <i class="fas fa-times"></i>
                    Hủy lớp
                </button>
            `);
        }

        return buttons.join('');
    }

    getTutorActionButtons(classItem) {
        let buttons = [];

        // Always show detail button
        buttons.push(`
            <button class="class-history-btn secondary" onclick="classHistoryManager.showClassDetail('${classItem.requestId}')">
                <i class="fas fa-eye"></i>
                Xem chi tiết
            </button>
        `);

        // Always show cancel button for tutors too (except completed and cancelled)
        if (classItem.status !== 'completed' && classItem.status !== 'cancelled') {
            buttons.push(`
                <button class="class-history-btn danger" onclick="classHistoryManager.showCancelClassModal('${classItem.requestId}')">
                    <i class="fas fa-times"></i>
                    Hủy lớp
                </button>
            `);
        }

        return buttons.join('');
    }

    // ===== UTILITY FUNCTIONS =====
    getStatusConfig(status) {
        const configs = {
            pending: { class: 'secondary', text: 'Chưa có gia sư ứng tuyển' },
            applied: { class: 'info', text: 'Đã có gia sư ứng tuyển' },
            active: { class: 'teaching', text: 'Đang giảng dạy'},
            completed: { class: 'success', text: 'Đã hoàn thành' },
            cancelled: { class: 'danger', text: 'Đã hủy' }
        };

        return configs[status] || configs.no_applications;
    }

    getSubjectIcon(subject) {
        const icons = {
            math: 'fa-calculator',
            physics: 'fa-atom',
            chemistry: 'fa-flask',
            english: 'fa-language',
            literature: 'fa-book',
            biology: 'fa-leaf',
            history: 'fa-landmark',
            geography: 'fa-globe'
        };

        return icons[subject] || 'fa-book';
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    // ===== MODAL FUNCTIONS =====
    showClassDetail(classId) {
        const classItem = this.classes.find(c => c.requestId === classId);
        console.log("xem chi tiết")
        if (!classItem) return;

        this.elements.modalTitle.textContent = `Chi tiết lớp học - ${classItem.subjectName}`;
        this.elements.modalBody.innerHTML = this.createClassDetailContent(classItem);
        this.showModal('classDetailModal');
    }

    async showApplications(classId) {
        const classItem = this.classes.find(c => c.requestId === classId);
        if (!classItem) return;

        // Generate sample applications
        const applications = await this.fetchApplicationsByRequestId(classId);

        this.elements.applicationsBody.innerHTML = applications
            .map(app => this.createApplicationCard(app, classId))
            .join('');

        this.showModal('applicationsModal');
    }

    async showConfirmSelectTutorModal(tutorId, classId) {
        try {
            console.log("Đang ký hợp đồng ", tutorId);

            const tutor = await this.findTutorById(tutorId);
            const classItem = this.classes.find(c => c.requestId === classId);

            if (!tutor || !classItem) {
                console.warn("Không tìm thấy tutor hoặc class");
                return;
            }

            this.selectedTutorForConfirm = tutor;
            this.selectedClassForConfirm = classItem;

            // Populate UI
            this.rebindModalElements?.(); 

            this.elements.selectedTutorInfo.innerHTML = `
            <div class="tutor-card-compact">
                <div class="tutor-avatar-small">
                    ${tutor.name.charAt(0)}
                </div>
                <div class="tutor-info-compact">
                    <h4>${tutor.name}</h4>
                    <div class="tutor-rating">
                        ${this.generateStarDisplay(tutor.rating)}
                        <span>${tutor.rating}/5 sao (${tutor.totalReviews || 10} đánh giá)</span>
                    </div>
                    <p class="tutor-qualification">${tutor.qualification}</p>
                    <p class="tutor-experience">${tutor.experience}</p>
                </div>
            </div>
        `;

            // Populate class info
            this.elements.classSummaryContent.innerHTML = `
            <div class="class-info-grid">
                <div class="info-row">
                    <span class="label">Môn học:</span>
                    <span class="value">${classItem.subjectName} - ${classItem.level}</span>
                </div>
                <div class="info-row">
                    <span class="label">Học phí:</span>
                    <span class="value">${classItem.fee}</span>
                </div>
                <div class="info-row">
                    <span class="label">Lịch học:</span>
                    <span class="value">${classItem.schedule}</span>
                </div>
                <div class="info-row">
                    <span class="label">Địa điểm:</span>
                    <span class="value">${classItem.location}</span>
                </div>
                <div class="info-row">
                    <span class="label">Học viên:</span>
                    <span class="value">${classItem.studentName}</span>
                </div>
            </div>
        `;

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            this.elements.startDate.min = tomorrow.toISOString().split('T')[0];
            this.elements.startDate.value = '';
            this.elements.confirmAgreement.checked = false;

            this.closeModal('applicationsModal');
            this.showModal('confirmSelectTutorModal');
        } catch (err) {
            console.error("Lỗi khi mở form ký hợp đồng:", err);
        }
    }



    showCancelClassModal(classId) {
        const classItem = this.classes.find(c => c.requestId === classId);
        if (!classItem) return;

        this.classToCancel = classItem;
        this.elements.cancelReason.value = '';
        this.elements.cancelNote.value = '';

        this.showModal('cancelClassModal');
    }

    showReviewForm(classId) {
        const classItem = this.classes.find(c => c.requestId === classId);
        if (!classItem || !classItem.selectedTutor) return;

        // Populate tutor info
        this.elements.reviewTutorInfo.innerHTML = `
            <div class="class-history-tutor-header">
                <div class="class-history-tutor-avatar">
                    ${classItem.selectedTutor.name.charAt(0)}
                </div>
                <div class="class-history-tutor-info">
                    <div class="class-history-tutor-name">${classItem.selectedTutor.name}</div>
                    <div class="class-history-tutor-rating">
                        <div class="class-history-stars">
                            ${this.generateStarDisplay(classItem.selectedTutor.rating)}
                        </div>
                        <span class="class-history-rating-text">${classItem.selectedTutor.rating}/5 sao</span>
                    </div>
                    <div class="class-history-tutor-experience">${classItem.selectedTutor.experience}</div>
                </div>
            </div>
        `;

        // Reset form
        this.resetReviewForm();

        // Store class ID for submission
        this.elements.reviewForm.dataset.classId = classId;

        this.showModal('reviewModal');
    }

    // ===== MODAL HELPERS =====
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

    // ===== HANDLE CONFIRM SELECT TUTOR =====
    async handleConfirmSelectTutor() {
        if (!this.selectedTutorForConfirm || !this.selectedClassForConfirm) return;

        // Validate form
        if (!this.elements.startDate.value) {
            this.showNotification('Vui lòng chọn ngày bắt đầu học', 'warning');
            return;
        }

        if (!this.elements.confirmAgreement.checked) {
            this.showNotification('Vui lòng xác nhận đồng ý với các điều khoản', 'warning');
            return;
        }

        // Disable button and show loading
        this.elements.confirmSelectTutor.disabled = true;
        this.elements.confirmSelectTutor.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

        try {
            // Chuẩn bị dữ liệu hợp đồng theo backend
            const contractData = {
                RequestId: this.selectedClassForConfirm.requestId,  // PascalCase
                StartDate: this.elements.startDate.value,           // yyyy-MM-dd
                EndDate: this.elements.endDate ? this.elements.endDate.value : null,
                Fee: Number(this.selectedClassForConfirm.fee) || 0,
                Schedule: this.selectedClassForConfirm.schedule || '',
                Location: this.selectedClassForConfirm.location || ''
            };

            console.log(contractData)

            // Lấy token (nếu có) để gửi kèm header Authorization
            const token = localStorage.getItem('token');  // hoặc chỗ lưu token của bạn

            const response = await fetch('http://localhost:7128/api/contract/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(contractData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Lỗi khi tạo hợp đồng');
            }

            const result = await response.json();

            // Cập nhật trạng thái lớp học trên client
            const classItem = this.classes.find(c => c.requestId === this.selectedClassForConfirm.requestId);
            if (classItem) {
                classItem.status = 'active';
                classItem.statusText = 'Đã tạo hợp đồng';
                classItem.selectedTutor = this.selectedTutorForConfirm;
                classItem.startDate = this.elements.startDate.value;
            }

            this.closeModal('confirmSelectTutorModal');
            this.showNotification('Đã tạo hợp đồng và xác nhận chọn gia sư thành công!', 'success');
            this.renderClasses();
            this.renderStats();

            // Reset button
            this.elements.confirmSelectTutor.disabled = false;
            this.elements.confirmSelectTutor.innerHTML = '<i class="fas fa-check"></i> Xác nhận chọn gia sư';

            // Clear selections
            this.selectedTutorForConfirm = null;
            this.selectedClassForConfirm = null;

        } catch (error) {
            this.showNotification(error.message, 'error');
            this.elements.confirmSelectTutor.disabled = false;
            this.elements.confirmSelectTutor.innerHTML = '<i class="fas fa-check"></i> Xác nhận chọn gia sư';
        }
    }



    // ===== HANDLE CANCEL CLASS =====
    handleConfirmCancelClass() {
        if (!this.classToCancel) return;

        // Validate form
        if (!this.elements.cancelReason.value) {
            this.showNotification('Vui lòng chọn lý do hủy lớp', 'warning');
            return;
        }

        // Disable button and show loading
        this.elements.confirmCancelClass.disabled = true;
        this.elements.confirmCancelClass.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang hủy...';

        // Simulate API call
        setTimeout(() => {
            // Update class data
            const classItem = this.classes.find(c => c.requestId === this.classToCancel.requestId);
            if (classItem) {
                classItem.status = 'cancelled';
                classItem.statusText = 'Đã hủy';
                classItem.cancelReason = this.elements.cancelReason.value;
                classItem.cancelNote = this.elements.cancelNote.value;
                classItem.cancelledAt = new Date();
            }

            this.closeModal('cancelClassModal');
            this.showNotification('Đã hủy lớp học thành công', 'success');
            this.renderClasses();
            this.renderStats();

            // Reset button
            this.elements.confirmCancelClass.disabled = false;
            this.elements.confirmCancelClass.innerHTML = '<i class="fas fa-trash"></i> Xác nhận hủy lớp';

            // Clear selection
            this.classToCancel = null;
        }, 1500);
    }

    // ===== REVIEW SYSTEM =====
    setRating(rating) {
        this.currentRating = rating;
        this.updateStarDisplay();
        this.elements.ratingText.textContent = `${rating} sao`;
    }

    highlightStars(rating) {
        const stars = this.elements.starRating.querySelectorAll('i');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.style.color = '#ffc107';
            } else {
                star.style.color = '#ddd';
            }
        });
    }

    resetStarHighlight() {
        this.updateStarDisplay();
    }

    updateStarDisplay() {
        const stars = this.elements.starRating.querySelectorAll('i');
        stars.forEach((star, index) => {
            if (index < (this.currentRating || 0)) {
                star.style.color = '#ffc107';
                star.classList.add('active');
            } else {
                star.style.color = '#ddd';
                star.classList.remove('active');
            }
        });
    }

    resetReviewForm() {
        this.currentRating = 0;
        this.updateStarDisplay();
        this.elements.ratingText.textContent = 'Chọn số sao';
        this.elements.reviewComment.value = '';
    }

    submitReview(e) {
        e.preventDefault();

        if (!this.currentRating) {
            this.showNotification('Vui lòng chọn số sao đánh giá', 'warning');
            return;
        }

        const comment = this.elements.reviewComment.value.trim();
        if (!comment) {
            this.showNotification('Vui lòng nhập nhận xét', 'warning');
            return;
        }

        const classId = this.elements.reviewForm.dataset.classId;

        // Simulate API call
        this.showNotification('Đang gửi đánh giá...', 'info');

        setTimeout(() => {
            // Update class data
            const classItem = this.classes.find(c => c.requestId === classId);
            if (classItem) {
                classItem.hasReviewed = true;
            }

            this.closeModal('reviewModal');
            this.showNotification('Đánh giá đã được gửi thành công!', 'success');
            this.renderClasses(); // Re-render to update buttons
        }, 1500);
    }

    // ===== ACTIONS =====
    refreshData() {
        this.showNotification('Đang làm mới dữ liệu...', 'info');
        this.loadClassData();
    }

    // ===== UI HELPERS =====
    showEmptyState() {
        if (this.elements.emptyState) {
            this.elements.emptyState.style.display = 'block';
        }
        if (this.elements.classesGrid) {
            this.elements.classesGrid.style.display = 'none';
        }
    }

    hideEmptyState() {
        if (this.elements.emptyState) {
            this.elements.emptyState.style.display = 'none';
        }
        if (this.elements.classesGrid) {
            this.elements.classesGrid.style.display = 'grid';
        }
    }

    showLoading() {
        if (this.elements.classesGrid) {
            this.elements.classesGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #0eb582;"></i>
                    <p style="margin-top: 1rem; color: #666;">Đang tải dữ liệu...</p>
                </div>
            `;
        }
    }

    hideLoading() {
        // Loading will be hidden when renderClasses() is called
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

    bindCardEvents() {
        // Re-bind any dynamic events if needed
    }

    async fetchApplicationsByRequestId(requestId) {
        try {
            const response = await fetch(`http://localhost:7128/api/application/by-request/${requestId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const applications = await response.json();

            console.log('Danh sách ứng tuyển:', applications);
            // Không gọi render ở đây, để bên ngoài xử lý UI

            return applications;  // Trả về dữ liệu

        } catch (error) {
            console.error("Lỗi khi lấy danh sách ứng tuyển:", error);
            return [];  // Trả về mảng rỗng khi lỗi
        }
    }

    renderApplicationList(applications) {
        const container = document.getElementById('application-list');
        container.innerHTML = '';

        if (applications.length === 0) {
            container.innerHTML = '<p>Chưa có gia sư nào ứng tuyển.</p>';
            return;
        }

        applications.forEach(app => {
            const appEl = document.createElement('div');
            appEl.className = 'application-card';
            appEl.innerHTML = `
                <h3>${app.name}</h3>
                <p><strong>Chuyên môn:</strong> ${app.specialization}</p>
                <p><strong>Kinh nghiệm:</strong> ${app.experience}</p>
                <p><strong>Bằng cấp:</strong> ${app.qualification}</p>
                <p><strong>Khu vực giảng dạy:</strong> ${app.teachingArea}</p>
                <p><strong>Đánh giá:</strong> ${app.rating.toFixed(1)} (${app.totalReviews} lượt đánh giá)</p>
                <p><strong>Ngày ứng tuyển:</strong> ${new Date(app.appliedAt).toLocaleDateString()}</p>
                <p><strong>Số điện thoại:</strong> ${app.phone}</p>
                <p><strong>Tin nhắn:</strong> ${app.message}</p>
            `;
            container.appendChild(appEl);
        });
    }


    // ===== SAMPLE DATA GENERATORS =====
    //generateSampleApplications(classId) {
    //    return [
    //        {
    //            id: 'app_1',
    //            tutorId: 'tutor_1',
    //            name: 'Thầy Nguyễn Văn Hùng',
    //            rating: 4.8,
    //            totalReviews: 25,
    //            experience: '5 năm kinh nghiệm giảng dạy',
    //            specialization: 'Toán học THPT, luyện thi đại học',
    //            qualification: 'Thạc sĩ Toán học - ĐH Bách Khoa',
    //            teachingArea: 'Quận Thanh Khê',
    //            status: 'pending',
    //            appliedAt: new Date('2025-04-16'),
    //            message: 'Em có 5 năm kinh nghiệm giảng dạy Toán THPT và đã giúp nhiều học sinh đạt điểm cao trong kỳ thi đại học. Em tự tin có thể giúp em học sinh này cải thiện kết quả học tập.',
    //            phone: '0936741254'
    //        },
    //        {
    //            id: 'app_2',
    //            tutorId: 'tutor_2',
    //            name: 'Cô Trần Thị Lan',
    //            rating: 4.6,
    //            totalReviews: 18,
    //            experience: '3 năm kinh nghiệm',
    //            specialization: 'Toán học cơ bản, nâng cao',
    //            qualification: 'Cử nhân Sư phạm Toán - ĐH Sư phạm',
    //            teachingArea: 'Huyện Hòa Vang',
    //            status: 'pending',
    //            appliedAt: new Date('2025-05-17'),
    //            message: 'Em có phương pháp giảng dạy sinh động, dễ hiểu và luôn theo sát tiến độ học tập của học sinh.',
    //            phone: '0973247811'
    //        }
    //    ];
    //}

    async findTutorById(tutorId) {
        try {
            const response = await fetch(`/api/tutors/${tutorId}`);
            if (!response.ok) throw new Error('Không tìm thấy gia sư');

            const tutor = await response.json();
            console.log("Gia sư kí hợp đồng", tutor)
            return tutor;
        } catch (err) {
            console.error('Lỗi khi lấy thông tin gia sư:', err);
            return null;
        }
    }


    createApplicationCard(application, classId) {
        return `
            <div class="class-history-application-card">
                <div class="class-history-tutor-header">
                    <div class="class-history-tutor-avatar">
                        ${application.name.charAt(0)}
                    </div>
                    <div class="class-history-tutor-info">
                        <div class="class-history-tutor-name">${application.name}</div>
                        <div class="class-history-tutor-rating">
                            <div class="class-history-stars">
                                ${this.generateStarDisplay(application.rating)}
                            </div>
                            <span class="class-history-rating-text">${application.rating}/5 (${application.totalReviews} đánh giá)</span>
                        </div>
                        <div class="class-history-tutor-experience">${application.experience}</div>
                    </div>
                    <div class="class-history-application-status ${application.status}">
                        ${application.status === 'pending' ? 'Đang chờ' : 'Đã phản hồi'}
                    </div>
                </div>
                <div class="class-history-tutor-details">
                    <p><strong>Chuyên môn:</strong> ${application.specialization}</p>
                    <p><strong>Trình độ:</strong> ${application.qualification}</p>
                    <p><strong>Khu vực dạy:</strong> ${application.teachingArea}</p>
                    <p><strong>Lời nhắn:</strong> ${application.message}</p>
                </div>
                <div class="class-history-application-actions">
                    <button class="class-history-btn secondary" onclick="classHistoryManager.viewTutorProfile('${application.tutorId}')">
                        <i class="fas fa-user"></i>
                        Xem hồ sơ
                    </button>
                    <button class="class-history-btn success" onclick="classHistoryManager.showConfirmSelectTutorModal('${application.tutorId}', '${classId}')">
                        <i class="fas fa-check"></i>
                        Chọn gia sư
                    </button>
                </div>
            </div>
        `;
    }

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

    createClassDetailContent(classItem) {
        console.log("tạo chi tiết")
        return `
            <div class="class-history-detail-content">
                <div class="detail-header">
                    <div class="detail-title">
                        <h3><i class="fas fa-book"></i> ${classItem.subjectName} - ${classItem.level}</h3>
                        <div class="status-badge ${this.getStatusConfig(classItem.status).class}">
                            ${this.getStatusConfig(classItem.status).text}
                        </div>
                    </div>
                </div>
                
                <div class="detail-grid">
                    <div class="detail-section full-width">
                        <h4><i class="fas fa-info-circle"></i> Thông tin cơ bản</h4>
                        <div class="detail-row">
                            <span class="label">Môn học:</span>
                            <span class="value">${classItem.subjectName}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Cấp độ:</span>
                            <span class="value">${classItem.level}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Học phí:</span>
                            <span class="value">${classItem.fee}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Lịch học:</span>
                            <span class="value">${classItem.schedule}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Địa điểm:</span>
                            <span class="value">${classItem.location}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Ngày đăng:</span>
                            <span class="value">${this.formatDate(classItem.createdAt)}</span>
                        </div>
                        ${classItem.startDate ? `
                        <div class="detail-row">
                            <span class="label">Ngày bắt đầu:</span>
                            <span class="value">${this.formatDate(classItem.startDate)}</span>
                        </div>
                        ` : ''}
                        ${classItem.completedAt ? `
                        <div class="detail-row">
                            <span class="label">Ngày hoàn thành:</span>
                            <span class="value">${this.formatDate(classItem.completedAt)}</span>
                        </div>
                        ` : ''}
                        ${classItem.cancelledAt ? `
                        <div class="detail-row">
                            <span class="label">Ngày hủy:</span>
                            <span class="value">${this.formatDate(classItem.cancelledAt)}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                        ${classItem.selectedTutor ? `
                <div class="detail-section full-width">
                    <h4><i class="fas fa-chalkboard-teacher"></i> Thông tin gia sư</h4>
                    <div class="detail-row">
                        <span class="label">Tên gia sư:</span>
                        <span class="value">${classItem.selectedTutor}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Địa chỉ:</span>
                        <span class="value">${classItem.location}</span>
                    </div>
                </div>
            ` : ''}

                
                ${classItem.cancelReason ? `
                <div class="detail-section full-width">
                    <h4><i class="fas fa-exclamation-triangle"></i> Thông tin hủy lớp</h4>
                    <div class="detail-row">
                        <span class="label">Lý do:</span>
                        <span class="value">${this.getCancelReasonText(classItem.cancelReason)}</span>
                    </div>
                    ${classItem.cancelNote ? `
                    <div class="detail-row">
                        <span class="label">Ghi chú:</span>
                        <span class="value">${classItem.cancelNote}</span>
                    </div>
                    ` : ''}
                </div>
                ` : ''}
            </div>
        `;
    }

    getCancelReasonText(reason) {
        const reasons = {
            'found_other_tutor': 'Đã tìm được gia sư khác',
            'no_longer_need': 'Không còn nhu cầu học',
            'financial_issue': 'Vấn đề tài chính',
            'schedule_conflict': 'Xung đột lịch học',
            'other': 'Lý do khác'
        };
        return reasons[reason] || reason;
    }

    // ===== ACTION HANDLERS =====
    viewTutorProfile(tutorId) {
        window.open(`tutor_profile.html?id=${tutorId}`, '_blank');
    }
}

// ===== INITIALIZATION =====
let classHistoryManager;

document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('class-history-page')) {
        classHistoryManager = new ClassHistoryManager();
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