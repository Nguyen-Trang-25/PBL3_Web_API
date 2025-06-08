// ===== CLASS HISTORY TUTOR PAGE JAVASCRIPT =====
// File: js/class_history_tutor.js

class TutorClassHistory {
    constructor() {
        this.applications = this.generateSampleData();
        this.filteredApplications = [...this.applications];
        this.currentModal = null;
        this.currentPage = 1;
        this.itemsPerPage = 6; // Hiển thị 6 lớp học mỗi trang
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadStatistics();
        this.loadApplications();
    }

    //async fetchHistoryData() {
    //    try {
    //        const response = await fetch('/api/historyRequest', {
    //            method: 'GET',
    //            headers: {
    //                'Content-Type': 'application/json',
    //                'Authorization': 'Bearer ' + localStorage.getItem('token') // nếu bạn dùng JWT
    //            }
    //        });

    //        if (!response.ok) {
    //            throw new Error('Không thể lấy dữ liệu lịch sử');
    //        }

    //        const data = await response.json();
    //        console.log(data)
    //        return data;
    //    } catch (error) {
    //        console.error('Lỗi khi tải lịch sử yêu cầu:', error);
    //        return [];
    //    }
    //}

    // ===== SAMPLE DATA GENERATION =====
    generateSampleData() {
        const subjects = [
            { id: 'math', name: 'Toán học', icon: 'fas fa-calculator' },
            { id: 'physics', name: 'Vật lý', icon: 'fas fa-atom' },
            { id: 'chemistry', name: 'Hóa học', icon: 'fas fa-flask' },
            { id: 'english', name: 'Tiếng Anh', icon: 'fas fa-language' },
            { id: 'literature', name: 'Ngữ văn', icon: 'fas fa-book' },
            { id: 'biology', name: 'Sinh học', icon: 'fas fa-dna' }
        ];

        const statuses = [
            { id: 'pending', name: 'Đang chờ xét duyệt', color: 'warning' },
            { id: 'accepted', name: 'Đã được chấp nhận', color: 'success' },
            { id: 'rejected', name: 'Đã bị từ chối', color: 'danger' },
            { id: 'others_selected', name: 'Đã chọn gia sư khác', color: 'secondary' },
            { id: 'class_cancelled', name: 'Lớp đã bị hủy', color: 'danger' }
        ];

        const students = [
            { name: 'Nguyễn Minh Anh', grade: 'Lớp 12', avatar: 'NMA', phone: '0987654321', email: 'minhanh@email.com', address: 'Quận 1, TP.HCM' },
            { name: 'Trần Văn Bình', grade: 'Lớp 11', avatar: 'TVB', phone: '0976543210', email: 'vanbinh@email.com', address: 'Quận 3, TP.HCM' },
            { name: 'Lê Thị Cẩm', grade: 'Lớp 10', avatar: 'LTC', phone: '0965432109', email: 'thicam@email.com', address: 'Quận 7, TP.HCM' },
            { name: 'Phạm Hoàng Dũng', grade: 'Lớp 9', avatar: 'PHD', phone: '0954321098', email: 'hoangdung@email.com', address: 'Quận Bình Thạnh, TP.HCM' },
            { name: 'Hoàng Thị Em', grade: 'Lớp 8', avatar: 'HTE', phone: '0943210987', email: 'thiem@email.com', address: 'Quận 2, TP.HCM' }
        ];

        const schedules = [
            'Thứ 2, 4, 6 - 19:00-20:30',
            'Thứ 3, 5, 7 - 18:00-19:30',
            'Thứ 2, 5 - 19:30-21:00',
            'Thứ 3, 6 - 18:30-20:00',
            'Thứ 4, 7 - 19:00-20:30'
        ];

        const notes = [
            'Con cần cải thiện điểm số môn này. Mong gia sư kiên trì và có phương pháp phù hợp.',
            'Học sinh hiền lành, nghe lời. Cần gia sư tận tâm hướng dẫn bài tập.',
            'Con đã có nền tảng tốt, cần gia sư giúp nâng cao và ôn thi đại học.',
            'Học sinh còn yếu ở phần lý thuyết, mong gia sư tập trung giải thích kỹ.',
            'Con hay bị phân tâm, cần gia sư kiên trì và có cách dạy thú vị.'
        ];

        const applications = [];
        const now = new Date();

        for (let i = 0; i < 12; i++) {
            const subject = subjects[Math.floor(Math.random() * subjects.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const student = students[Math.floor(Math.random() * students.length)];

            const appliedDate = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000);
            const postedDate = new Date(appliedDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);

            applications.push({
                id: i + 1,
                title: `Gia sư ${subject.name} ${student.grade}`,
                subject: subject,
                status: status,
                student: student,
                postedDate: postedDate,
                appliedDate: appliedDate,
                monthlyFee: Math.floor(Math.random() * 2000000 + 1500000),
                schedule: schedules[Math.floor(Math.random() * schedules.length)],
                location: student.address,
                parentNote: notes[Math.floor(Math.random() * notes.length)]
            });
        }

        return applications.sort((a, b) => b.appliedDate - a.appliedDate);
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Filter events
        document.getElementById('tutorStatusFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('tutorSubjectFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('tutorDateFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('tutorRefreshBtn').addEventListener('click', () => this.refreshData());

        // Modal events
        this.setupModalEvents();
    }

    setupModalEvents() {
        // Close modal events
        const closeButtons = document.querySelectorAll('.tutor-modal-close');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });

        // Modal overlay click to close
        const overlays = document.querySelectorAll('.tutor-modal-overlay');
        overlays.forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal();
                }
            });
        });

        // Withdraw modal events
        document.getElementById('cancelWithdraw').addEventListener('click', () => this.closeModal());
        document.getElementById('confirmWithdraw').addEventListener('click', () => this.handleWithdraw());
    }

    // ===== FILTER FUNCTIONALITY =====
    applyFilters() {
        const statusFilter = document.getElementById('tutorStatusFilter').value;
        const subjectFilter = document.getElementById('tutorSubjectFilter').value;
        const dateFilter = document.getElementById('tutorDateFilter').value;

        this.filteredApplications = this.applications.filter(app => {
            // Status filter
            if (statusFilter && app.status.id !== statusFilter) return false;

            // Subject filter
            if (subjectFilter && app.subject.id !== subjectFilter) return false;

            // Date filter
            if (dateFilter) {
                const now = new Date();
                const appDate = app.appliedDate;

                switch (dateFilter) {
                    case 'this_week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        if (appDate < weekAgo) return false;
                        break;
                    case 'this_month':
                        if (appDate.getMonth() !== now.getMonth() || appDate.getFullYear() !== now.getFullYear()) return false;
                        break;
                    case 'last_month':
                        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                        if (appDate < lastMonth || appDate >= thisMonth) return false;
                        break;
                    case 'this_year':
                        if (appDate.getFullYear() !== now.getFullYear()) return false;
                        break;
                }
            }

            return true;
        });

        this.currentPage = 1; // Reset về trang 1 khi filter
        this.loadStatistics();
        this.loadApplications();
    }

    refreshData() {
        const refreshBtn = document.getElementById('tutorRefreshBtn');
        const icon = refreshBtn.querySelector('i');

        // Add spinning animation
        icon.style.animation = 'spin 1s linear infinite';
        refreshBtn.disabled = true;

        setTimeout(() => {
            // Reset filters
            document.getElementById('tutorStatusFilter').value = '';
            document.getElementById('tutorSubjectFilter').value = '';
            document.getElementById('tutorDateFilter').value = '';

            this.filteredApplications = [...this.applications];
            this.currentPage = 1; // Reset về trang 1
            this.loadStatistics();
            this.loadApplications();

            // Remove spinning animation
            icon.style.animation = '';
            refreshBtn.disabled = false;
        }, 1000);
    }

    // ===== DATA LOADING =====
    loadStatistics() {
        const stats = {
            total: this.filteredApplications.length,
            pending: this.filteredApplications.filter(app => app.status.id === 'pending').length,
            accepted: this.filteredApplications.filter(app => app.status.id === 'accepted').length,
            rejected: this.filteredApplications.filter(app => app.status.id === 'rejected' || app.status.id === 'others_selected' || app.status.id === 'class_cancelled').length
        };

        const statsContainer = document.getElementById('tutorStatsContainer');
        statsContainer.innerHTML = `
            <div class="tutor-stat-card">
                <div class="tutor-stat-icon total">
                    <i class="fas fa-clipboard-list"></i>
                </div>
                <div class="tutor-stat-number">${stats.total}</div>
                <div class="tutor-stat-label">Tổng ứng tuyển</div>
            </div>
            <div class="tutor-stat-card">
                <div class="tutor-stat-icon pending">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="tutor-stat-number">${stats.pending}</div>
                <div class="tutor-stat-label">Đang chờ duyệt</div>
            </div>
            <div class="tutor-stat-card">
                <div class="tutor-stat-icon accepted">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="tutor-stat-number">${stats.accepted}</div>
                <div class="tutor-stat-label">Đã được chấp nhận</div>
            </div>
            <div class="tutor-stat-card">
                <div class="tutor-stat-icon rejected">
                    <i class="fas fa-times-circle"></i>
                </div>
                <div class="tutor-stat-number">${stats.rejected}</div>
                <div class="tutor-stat-label">Không thành công</div>
            </div>
        `;
    }

    loadApplications() {
        const grid = document.getElementById('tutorApplicationsGrid');
        const emptyState = document.getElementById('tutorEmptyState');

        if (this.filteredApplications.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            this.hidePagination();
            return;
        }

        grid.style.display = 'grid';
        emptyState.style.display = 'none';

        // Tính toán pagination
        const totalPages = Math.ceil(this.filteredApplications.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentItems = this.filteredApplications.slice(startIndex, endIndex);

        // Hiển thị các lớp học của trang hiện tại
        grid.innerHTML = currentItems.map(app => this.createApplicationCard(app)).join('');

        // Hiển thị pagination
        this.renderPagination(totalPages);
    }

    createApplicationCard(app) {
        const timeAgo = this.getTimeAgo(app.appliedDate);
        const canWithdraw = app.status.id === 'pending';
        const canContact = app.status.id === 'accepted';

        return `
            <div class="tutor-application-card">
                <div class="tutor-card-header">
                    <div class="tutor-status-badge ${app.status.id}">
                        ${app.status.name}
                    </div>
                    <div class="tutor-subject-badge">
                        <i class="${app.subject.icon}"></i>
                        ${app.subject.name}
                    </div>
                    <h3 class="tutor-card-title">${app.title}</h3>
                    <div class="tutor-application-info">
                        <i class="fas fa-calendar"></i>
                        Ứng tuyển ${timeAgo}
                    </div>
                </div>
                <div class="tutor-card-body">
                    <div class="tutor-info-grid">
                        <div class="tutor-info-item">
                            <div class="tutor-info-label">Lương tháng</div>
                            <div class="tutor-info-value">${this.formatCurrency(app.monthlyFee)}</div>
                        </div>
                        <div class="tutor-info-item">
                            <div class="tutor-info-label">Lịch dạy</div>
                            <div class="tutor-info-value">${app.schedule}</div>
                        </div>
                        <div class="tutor-info-item" style="grid-column: 1 / -1;">
                            <div class="tutor-info-label">Địa điểm</div>
                            <div class="tutor-info-value">${app.location}</div>
                        </div>
                    </div>
                    <div class="tutor-student-preview">
                        <div class="tutor-student-name">${app.student.name}</div>
                        <div class="tutor-student-grade">${app.student.grade}</div>
                    </div>
                </div>
                <div class="tutor-card-footer">
                    <button class="tutor-btn primary" onclick="tutorHistory.showApplicationDetail(${app.id})">
                        <i class="fas fa-eye"></i>
                        Chi tiết
                    </button>
                    <button class="tutor-btn secondary" onclick="tutorHistory.showStudentInfo(${app.id})">
                        <i class="fas fa-user"></i>
                        Học viên
                    </button>
                    ${canContact ? `
                        <button class="tutor-btn success" onclick="tutorHistory.showContactInfo(${app.id})">
                            <i class="fas fa-phone"></i>
                            Liên hệ
                        </button>
                    ` : ''}
                    ${canWithdraw ? `
                        <button class="tutor-btn danger" onclick="tutorHistory.showWithdrawModal(${app.id})">
                            <i class="fas fa-times"></i>
                            Rút ứng tuyển
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // ===== PAGINATION FUNCTIONS =====
    renderPagination(totalPages) {
        let paginationContainer = document.getElementById('tutorPagination');

        // Tạo container pagination nếu chưa có
        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.id = 'tutorPagination';
            paginationContainer.className = 'tutor-pagination';

            const applicationsGrid = document.getElementById('tutorApplicationsGrid');
            applicationsGrid.parentNode.insertBefore(paginationContainer, applicationsGrid.nextSibling);
        }

        if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        }

        paginationContainer.style.display = 'flex';

        let paginationHTML = '';

        // Nút Previous
        if (this.currentPage > 1) {
            paginationHTML += `
                <button class="tutor-page-btn" onclick="tutorHistory.goToPage(${this.currentPage - 1})">
                    <i class="fas fa-chevron-left"></i>
                    Trước
                </button>
            `;
        }

        // Các số trang
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Trang đầu và dấu ...
        if (startPage > 1) {
            paginationHTML += `
                <button class="tutor-page-btn" onclick="tutorHistory.goToPage(1)">1</button>
            `;
            if (startPage > 2) {
                paginationHTML += `<span class="tutor-page-dots">...</span>`;
            }
        }

        // Các trang ở giữa
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="tutor-page-btn ${i === this.currentPage ? 'active' : ''}" 
                        onclick="tutorHistory.goToPage(${i})">
                    ${i}
                </button>
            `;
        }

        // Dấu ... và trang cuối
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span class="tutor-page-dots">...</span>`;
            }
            paginationHTML += `
                <button class="tutor-page-btn" onclick="tutorHistory.goToPage(${totalPages})">${totalPages}</button>
            `;
        }

        // Nút Next
        if (this.currentPage < totalPages) {
            paginationHTML += `
                <button class="tutor-page-btn" onclick="tutorHistory.goToPage(${this.currentPage + 1})">
                    Sau
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;
        }

        paginationContainer.innerHTML = paginationHTML;

        // Hiển thị thông tin trang
        this.renderPageInfo();
    }

    renderPageInfo() {
        let pageInfoContainer = document.getElementById('tutorPageInfo');

        if (!pageInfoContainer) {
            pageInfoContainer = document.createElement('div');
            pageInfoContainer.id = 'tutorPageInfo';
            pageInfoContainer.className = 'tutor-page-info';

            const paginationContainer = document.getElementById('tutorPagination');
            paginationContainer.parentNode.insertBefore(pageInfoContainer, paginationContainer);
        }

        const totalItems = this.filteredApplications.length;
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, totalItems);

        pageInfoContainer.innerHTML = `
            Hiển thị ${startItem}-${endItem} trong tổng ${totalItems} ứng tuyển
        `;
    }

    goToPage(page) {
        this.currentPage = page;
        this.loadApplications();

        // Scroll to top của applications grid
        document.getElementById('tutorApplicationsGrid').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    hidePagination() {
        const paginationContainer = document.getElementById('tutorPagination');
        const pageInfoContainer = document.getElementById('tutorPageInfo');

        if (paginationContainer) paginationContainer.style.display = 'none';
        if (pageInfoContainer) pageInfoContainer.style.display = 'none';
    }
    showApplicationDetail(applicationId) {
        const app = this.applications.find(a => a.id === applicationId);
        if (!app) return;

        const modal = document.getElementById('tutorApplicationDetailModal');
        const body = document.getElementById('tutorModalBody');

        body.innerHTML = `
            <div class="tutor-application-detail">
                <div class="tutor-detail-header">
                    <h3><i class="fas fa-info-circle"></i> ${app.title}</h3>
                </div>
                <div class="tutor-detail-grid">
                    <div class="tutor-detail-section">
                        <h4><i class="fas fa-clipboard"></i> Thông tin cơ bản</h4>
                        <div class="tutor-detail-row">
                            <span class="label">Môn học:</span>
                            <span class="value">${app.subject.name}</span>
                        </div>
                        <div class="tutor-detail-row">
                            <span class="label">Trạng thái:</span>
                            <span class="value">${app.status.name}</span>
                        </div>
                        <div class="tutor-detail-row">
                            <span class="label">Ngày đăng:</span>
                            <span class="value">${this.formatDate(app.postedDate)}</span>
                        </div>
                        <div class="tutor-detail-row">
                            <span class="label">Ngày ứng tuyển:</span>
                            <span class="value">${this.formatDate(app.appliedDate)}</span>
                        </div>
                    </div>
                    <div class="tutor-detail-section">
                        <h4><i class="fas fa-money-bill"></i> Thông tin lương</h4>
                        <div class="tutor-detail-row">
                            <span class="label">Lương tháng:</span>
                            <span class="value">${this.formatCurrency(app.monthlyFee)}</span>
                        </div>
                        <div class="tutor-detail-row">
                            <span class="label">Lịch dạy:</span>
                            <span class="value">${app.schedule}</span>
                        </div>
                        <div class="tutor-detail-row">
                            <span class="label">Địa điểm:</span>
                            <span class="value">${app.location}</span>
                        </div>
                    </div>
                    <div class="tutor-detail-section full-width">
                        <h4><i class="fas fa-comment"></i> Ghi chú từ phụ huynh</h4>
                        <p style="margin: 0; color: #333; line-height: 1.6; font-style: italic;">"${app.parentNote}"</p>
                    </div>
                </div>
            </div>
        `;

        this.showModal(modal);
    }

    showStudentInfo(applicationId) {
        const app = this.applications.find(a => a.id === applicationId);
        if (!app) return;

        const modal = document.getElementById('tutorStudentInfoModal');
        const body = document.getElementById('studentInfoBody');

        body.innerHTML = `
            <div class="tutor-student-info-detail">
                <div class="tutor-student-card">
                    <div class="tutor-student-avatar">${app.student.avatar}</div>
                    <div class="tutor-student-name">${app.student.name}</div>
                    <div class="tutor-student-grade">${app.student.grade}</div>
                </div>
                <div class="tutor-student-details">
                    <div class="tutor-detail-row">
                        <span class="label">Họ và tên:</span>
                        <span class="value">${app.student.name}</span>
                    </div>
                    <div class="tutor-detail-row">
                        <span class="label">Lớp học:</span>
                        <span class="value">${app.student.grade}</span>
                    </div>
                    <div class="tutor-detail-row">
                        <span class="label">Môn học cần hỗ trợ:</span>
                        <span class="value">${app.subject.name}</span>
                    </div>
                    <div class="tutor-detail-row">
                        <span class="label">Địa chỉ:</span>
                        <span class="value">${app.student.address}</span>
                    </div>
                    ${app.status.id === 'accepted' ? `
                        <div class="tutor-detail-row">
                            <span class="label">Số điện thoại:</span>
                            <span class="value">${app.student.phone}</span>
                        </div>
                        <div class="tutor-detail-row">
                            <span class="label">Email:</span>
                            <span class="value">${app.student.email}</span>
                        </div>
                    ` : `
                        <div class="tutor-contact-note-simple">
                            <p>Thông tin liên hệ sẽ hiển thị sau khi được chấp nhận.</p>
                        </div>
                    `}
                </div>
            </div>
        `;

        this.showModal(modal);
    }

    showContactInfo(applicationId) {
        const app = this.applications.find(a => a.id === applicationId);
        if (!app) return;

        const modal = document.getElementById('tutorContactModal');
        const contactInfo = document.getElementById('tutorContactInfo');

        if (app.status.id === 'accepted') {
            contactInfo.innerHTML = `
                <div class="tutor-contact-item">
                    <i class="fas fa-user"></i>
                    <span class="contact-label">Họ tên:</span>
                    <span class="contact-value">${app.student.name}</span>
                </div>
                <div class="tutor-contact-item">
                    <i class="fas fa-phone"></i>
                    <span class="contact-label">Điện thoại:</span>
                    <span class="contact-value">${app.student.phone}</span>
                </div>
                <div class="tutor-contact-item">
                    <i class="fas fa-envelope"></i>
                    <span class="contact-label">Email:</span>
                    <span class="contact-value">${app.student.email}</span>
                </div>
                <div class="tutor-contact-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span class="contact-label">Địa chỉ:</span>
                    <span class="contact-value">${app.student.address}</span>
                </div>
            `;
        } else {
            contactInfo.innerHTML = `
                <div class="tutor-contact-locked">
                    <i class="fas fa-lock"></i>
                    <p>Thông tin liên hệ sẽ hiển thị sau khi được chấp nhận</p>
                </div>
            `;
        }

        this.showModal(modal);
    }

    showWithdrawModal(applicationId) {
        this.currentApplicationId = applicationId;
        const modal = document.getElementById('tutorWithdrawModal');

        // Reset form
        document.getElementById('withdrawReason').value = '';
        document.getElementById('withdrawNote').value = '';

        this.showModal(modal);
    }

    handleWithdraw() {
        const reason = document.getElementById('withdrawReason').value;
        const note = document.getElementById('withdrawNote').value;

        if (!reason) {
            alert('Vui lòng chọn lý do rút ứng tuyển!');
            return;
        }

        // Simulate API call
        const confirmBtn = document.getElementById('confirmWithdraw');
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

        setTimeout(() => {
            // Remove application from list
            this.applications = this.applications.filter(app => app.id !== this.currentApplicationId);
            this.applyFilters();

            this.closeModal();
            this.showNotification('Đã rút ứng tuyển thành công!', 'success');

            // Reset button
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<i class="fas fa-times"></i> Xác nhận rút ứng tuyển';
        }, 2000);
    }

    // ===== MODAL UTILITIES =====
    showModal(modal) {
        modal.classList.add('active');
        this.currentModal = modal;
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        if (this.currentModal) {
            this.currentModal.classList.remove('active');
            this.currentModal = null;
            document.body.style.overflow = '';
        }
    }

    // ===== UTILITY FUNCTIONS =====
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }

    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'hôm nay';
        if (days === 1) return 'hôm qua';
        if (days < 7) return `${days} ngày trước`;
        if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
        if (days < 365) return `${Math.floor(days / 30)} tháng trước`;
        return `${Math.floor(days / 365)} năm trước`;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle"></i>
            ${message}
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : '#17a2b8'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1001;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    window.tutorHistory = new TutorClassHistory();
});

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TutorClassHistory;
}