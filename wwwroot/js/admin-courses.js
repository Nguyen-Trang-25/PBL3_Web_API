// ===== ADMIN COURSES MANAGEMENT JAVASCRIPT - OBJECT-ORIENTED VERSION =====
// File: js/admin_courses_oop.js

class AdminCoursesManager {
    constructor() {
        this.courses = [];
        this.filteredCourses = [];
        this.currentModal = null;
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.selectedCount = 0;

        // Elements cache - sẽ được thiết lập sau khi DOM ready
        this.elements = {};

        this.init();
    }

    init() {
        this.cacheElements();
        this.loadCourses();
        this.setupEventListeners();
        this.addNotificationStyles();
        this.updateStatistics();

        console.log('Admin Courses Manager initialized');
    }

    // ===== CACHE ELEMENTS =====
    cacheElements() {
        this.elements = {
            // Checkboxes
            selectAllCheckbox: document.getElementById('selectAll'),

            // Search & Filters
            searchInput: document.getElementById('searchCourses'),
            searchBtn: document.getElementById('searchBtn'),
            statusFilter: document.getElementById('statusFilter'),
            subjectFilter: document.getElementById('subjectFilter'),
            applyFiltersBtn: document.getElementById('applyFilters'),
            resetFiltersBtn: document.getElementById('resetFilters'),

            // Batch Actions
            batchActions: document.getElementById('batchActions'),
            batchCancel: document.getElementById('batchCancel'),
            selectedCount: document.getElementById('selectedCount'),

            // Table & Pagination
            coursesTableBody: document.getElementById('coursesTableBody'),

            // Modals
            courseDetailModal: document.getElementById('courseDetailModal'),
            editCourseModal: document.getElementById('editCourseModal'),
            cancelCourseModal: document.getElementById('cancelCourseModal'),
            confirmModal: document.getElementById('confirmModal'),

            // Action buttons
            exportCoursesBtn: document.getElementById('exportCoursesBtn'),
            refreshTable: document.getElementById('refreshTable')
        };
    }

    // ===== EVENT LISTENERS SETUP =====
    setupEventListeners() {
        this.setupCheckboxEvents();
        this.setupSearchEvents();
        this.setupFilterEvents();
        this.setupBatchActionEvents();
        this.setupCourseActionEvents();
        this.setupModalEvents();
        this.setupPaginationEvents();
        this.setupUtilityButtonEvents();
    }

    setupCheckboxEvents() {
        // Select all functionality
        if (this.elements.selectAllCheckbox) {
            this.elements.selectAllCheckbox.addEventListener('change', (e) => {
                this.handleSelectAll(e.target.checked);
            });
        }

        // Individual checkbox functionality will be set up when courses are loaded
    }

    setupSearchEvents() {
        if (this.elements.searchBtn) {
            this.elements.searchBtn.addEventListener('click', () => this.performSearch());
        }

        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });

            // Real-time search with debounce
            let searchTimeout;
            this.elements.searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => this.performSearch(), 500);
            });
        }
    }

    setupFilterEvents() {
        if (this.elements.applyFiltersBtn) {
            this.elements.applyFiltersBtn.addEventListener('click', () => this.applyFilters());
        }

        if (this.elements.resetFiltersBtn) {
            this.elements.resetFiltersBtn.addEventListener('click', () => this.resetFilters());
        }
    }

    setupBatchActionEvents() {
        if (this.elements.batchCancel) {
            this.elements.batchCancel.addEventListener('click', () => this.performBatchAction('cancel'));
        }
    }

    setupCourseActionEvents() {
        // Event delegation for dynamic buttons
        document.addEventListener('click', (e) => {
            const target = e.target.closest('.action-btn');
            if (!target) return;

            const courseId = target.dataset.courseId;
            const action = target.classList[1]; // Second class is the action type

            this.handleCourseAction(action, courseId);
        });
    }

    setupModalEvents() {
        // Close modal events
        const closeButtons = document.querySelectorAll('[id^="close"], [id^="cancel"]');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });

        // Modal action buttons
        this.setupModalActionButtons();

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });

        // Close modals with ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    setupModalActionButtons() {
        // Edit Course Modal
        const editCourseForm = document.getElementById('editCourseForm');
        if (editCourseForm) {
            editCourseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditCourseSubmission();
            });
        }

        // Cancel Course Modal
        const confirmCancelCourse = document.getElementById('confirmCancelCourse');
        if (confirmCancelCourse) {
            confirmCancelCourse.addEventListener('click', () => this.handleCancelCourse());
        }

        // Course Detail Modal Actions
        const editCourseFromModal = document.getElementById('editCourseFromModal');
        const cancelCourseFromModal = document.getElementById('cancelCourseFromModal');

        if (editCourseFromModal) {
            editCourseFromModal.addEventListener('click', () => {
                const courseId = this.elements.courseDetailModal.dataset.courseId;
                this.closeModal();
                this.editCourse(courseId);
            });
        }

        if (cancelCourseFromModal) {
            cancelCourseFromModal.addEventListener('click', () => {
                const courseId = this.elements.courseDetailModal.dataset.courseId;
                this.closeModal();
                this.showCancelCourseModal(courseId);
            });
        }
    }

    setupPaginationEvents() {
        // Will be set up when pagination is rendered
    }

    setupUtilityButtonEvents() {
        if (this.elements.exportCoursesBtn) {
            this.elements.exportCoursesBtn.addEventListener('click', () => this.exportCourses());
        }

        if (this.elements.refreshTable) {
            this.elements.refreshTable.addEventListener('click', () => this.refreshData());
        }
    }

    // ===== CHECKBOX MANAGEMENT =====
    handleSelectAll(checked) {
        const courseCheckboxes = document.querySelectorAll('.course-checkbox');
        courseCheckboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
        this.updateBatchActionsVisibility();
        this.updateSelectedCount();
    }

    setupIndividualCheckboxes() {
        const courseCheckboxes = document.querySelectorAll('.course-checkbox');
        courseCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateSelectAllState();
                this.updateBatchActionsVisibility();
                this.updateSelectedCount();
            });
        });
    }

    updateSelectAllState() {
        const courseCheckboxes = document.querySelectorAll('.course-checkbox');
        const checkedCheckboxes = document.querySelectorAll('.course-checkbox:checked');

        if (checkedCheckboxes.length === courseCheckboxes.length) {
            this.elements.selectAllCheckbox.checked = true;
            this.elements.selectAllCheckbox.indeterminate = false;
        } else if (checkedCheckboxes.length === 0) {
            this.elements.selectAllCheckbox.checked = false;
            this.elements.selectAllCheckbox.indeterminate = false;
        } else {
            this.elements.selectAllCheckbox.checked = false;
            this.elements.selectAllCheckbox.indeterminate = true;
        }
    }

    updateSelectedCount() {
        this.selectedCount = document.querySelectorAll('.course-checkbox:checked').length;
        if (this.elements.selectedCount) {
            this.elements.selectedCount.textContent = this.selectedCount;
        }
    }

    updateBatchActionsVisibility() {
        const selectedCount = document.querySelectorAll('.course-checkbox:checked').length;
        if (this.elements.batchActions) {
            this.elements.batchActions.style.display = selectedCount > 0 ? 'flex' : 'none';
        }
    }

    // ===== SEARCH & FILTER FUNCTIONALITY =====
    performSearch() {
        const searchTerm = this.elements.searchInput.value.toLowerCase().trim();
        const rows = document.querySelectorAll('#coursesTableBody tr');
        let visibleCount = 0;

        rows.forEach(row => {
            const courseName = row.querySelector('.course-name')?.textContent.toLowerCase() || '';
            const courseId = row.querySelector('.course-id')?.textContent.toLowerCase() || '';
            const tutorName = row.querySelector('.tutor-name')?.textContent.toLowerCase() || '';
            const studentName = row.querySelector('.student-name')?.textContent.toLowerCase() || '';
            const subject = row.querySelector('.subject-badge')?.textContent.toLowerCase() || '';

            const isMatch = courseName.includes(searchTerm) ||
                courseId.includes(searchTerm) ||
                tutorName.includes(searchTerm) ||
                studentName.includes(searchTerm) ||
                subject.includes(searchTerm);

            if (isMatch || searchTerm === '') {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        this.updatePaginationInfo(visibleCount);
    }

    applyFilters() {
        const statusFilter = this.elements.statusFilter.value;
        const subjectFilter = this.elements.subjectFilter.value;
        const rows = document.querySelectorAll('#coursesTableBody tr');
        let visibleCount = 0;

        rows.forEach(row => {
            let showRow = true;

            // Status filter
            if (statusFilter !== 'all') {
                const statusElement = row.querySelector('.status');
                const statusClass = statusElement?.classList.contains(statusFilter);
                if (!statusClass) showRow = false;
            }

            // Subject filter
            if (subjectFilter !== 'all') {
                const subjectElement = row.querySelector('.subject-badge');
                const subjectClass = subjectElement?.classList.contains(subjectFilter);
                if (!subjectClass) showRow = false;
            }

            if (showRow) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        this.updatePaginationInfo(visibleCount);
        this.showNotification('Đã áp dụng bộ lọc', 'success');
    }

    resetFilters() {
        this.elements.statusFilter.value = 'all';
        this.elements.subjectFilter.value = 'all';
        this.elements.searchInput.value = '';

        const rows = document.querySelectorAll('#coursesTableBody tr');
        rows.forEach(row => {
            row.style.display = '';
        });

        this.updatePaginationInfo(rows.length);
        this.showNotification('Đã đặt lại bộ lọc', 'info');
    }

    // ===== BATCH ACTIONS =====
    performBatchAction(action) {
        const selectedCheckboxes = document.querySelectorAll('.course-checkbox:checked');
        const selectedCount = selectedCheckboxes.length;

        if (selectedCount === 0) {
            this.showNotification('Vui lòng chọn ít nhất một lớp học', 'warning');
            return;
        }

        let actionText = 'xóa';
        let confirmMessage = `Bạn có chắc chắn muốn xóa ${selectedCount} lớp học đã chọn?`;

        this.showConfirmModal(
            `Xác nhận ${actionText} hàng loạt`,
            confirmMessage,
            () => this.executeBatchAction(action, selectedCheckboxes)
        );
    }

    executeBatchAction(action, checkboxes) {
        this.showNotification('Đang xử lý...', 'info');

        setTimeout(() => {
            checkboxes.forEach(checkbox => {
                const row = checkbox.closest('tr');
                this.updateCourseStatus(row, 'cancelled');
                this.updateCourseActions(row, 'cancelled');
            });

            // Reset selections
            this.elements.selectAllCheckbox.checked = false;
            checkboxes.forEach(checkbox => checkbox.checked = false);
            this.updateBatchActionsVisibility();

            this.showNotification(`Đã xóa thành công ${checkboxes.length} lớp học`, 'success');
            this.updateStatistics();
        }, 1500);
    }

    // ===== COURSE ACTIONS =====
    handleCourseAction(action, courseId) {
        switch (action) {
            case 'view':
                this.showCourseDetail(courseId);
                break;
            case 'edit':
                this.editCourse(courseId);
                break;
            case 'cancel':
                this.showCancelCourseModal(courseId);
                break;
            case 'archive':
                this.archiveCourse(courseId);
                break;
        }
    }

    updateCourseActions(row, status) {
        const actionsContainer = row.querySelector('.action-buttons');
        const courseId = row.dataset.courseId;

        actionsContainer.innerHTML = '';

        // Xem chi tiết
        const viewBtn = this.createCourseActionButton('view', 'fas fa-eye', 'Xem chi tiết', courseId);
        actionsContainer.appendChild(viewBtn);

        // Chỉnh sửa
        const editBtn = this.createCourseActionButton('edit', 'fas fa-edit', 'Chỉnh sửa', courseId);
        actionsContainer.appendChild(editBtn);

        // Xóa lớp học (luôn hiển thị)
        const cancelBtn = this.createCourseActionButton('cancel', 'fas fa-times', 'Xóa lớp', courseId);
        actionsContainer.appendChild(cancelBtn);
    }

    createCourseActionButton(className, iconClass, title, courseId) {
        const button = document.createElement('button');
        button.className = `action-btn ${className}`;
        button.title = title;
        button.dataset.courseId = courseId;
        button.innerHTML = `<i class="${iconClass}"></i>`;
        return button;
    }

    // ===== COURSE DETAIL FUNCTIONS =====
    showCourseDetail(courseId) {
        const row = document.querySelector(`tr[data-course-id="${courseId}"]`);
        if (!row) return;

        const courseData = this.extractCourseDataFromRow(row);
        this.populateCourseDetailModal(courseData);

        // Store course ID for modal actions
        this.elements.courseDetailModal.dataset.courseId = courseId;

        // Show modal
        this.showModal('courseDetailModal');
    }

    extractCourseDataFromRow(row) {
        const courseName = row.querySelector('.course-name')?.textContent.trim() || '';
        const courseId = row.querySelector('.course-id')?.textContent.trim() || '';
        const courseSchedule = row.querySelector('.course-schedule')?.textContent.trim() || '';
        const subject = row.querySelector('.subject-badge')?.textContent.trim() || '';
        const tutorName = row.querySelector('.tutor-name')?.textContent.trim() || '';
        const tutorRating = row.querySelector('.rating-text')?.textContent.trim() || '';
        const studentName = row.querySelector('.student-name')?.textContent.trim() || '';
        const studentGrade = row.querySelector('.student-grade')?.textContent.trim() || '';
        const status = row.querySelector('.status')?.textContent.trim() || '';
        const fee = row.querySelector('.fee-amount')?.textContent.trim() || '';
        const feeperiod = row.querySelector('.fee-period')?.textContent.trim() || '';
        const createDate = row.querySelector('td:nth-child(8)')?.textContent.trim() || '';

        return {
            id: row.dataset.courseId,
            name: courseName,
            courseId: courseId,
            schedule: courseSchedule,
            subject: subject,
            tutorName: tutorName,
            tutorRating: tutorRating,
            studentName: studentName,
            studentGrade: studentGrade,
            status: status,
            fee: fee,
            feePeriod: feeperiod,
            createDate: createDate,
            // Mock additional data
            classLevel: courseName.match(/\d+[A-Z]?\d*/) ? courseName.match(/\d+[A-Z]?\d*/)[0] : '12',
            format: 'Online',
            startDate: createDate,
            description: 'Lớp học ôn tập và nâng cao kiến thức'
        };
    }

    populateCourseDetailModal(courseData) {
        document.getElementById('modalCourseName').textContent = courseData.name;
        document.getElementById('modalCourseId').textContent = courseData.courseId;
        document.getElementById('modalCourseFee').textContent = courseData.fee;
        document.getElementById('modalCourseSubject').textContent = courseData.subject;
        document.getElementById('modalCourseClass').textContent = 'Lớp ' + courseData.classLevel;
        document.getElementById('modalCourseSchedule').textContent = courseData.schedule || 'T2, T4, T6 - 19:00-21:00';
        document.getElementById('modalCourseStartDate').textContent = courseData.startDate;

        // Gia sư
        document.getElementById('modalTutorName').textContent = courseData.tutorName || 'Chưa có gia sư';
        document.getElementById('modalTutorRole').textContent = courseData.tutorName ? 'Gia sư ' + courseData.subject.replace(/.*\s/, '') : 'Đang tìm gia sư';

        // Học viên
        document.getElementById('modalStudentName').textContent = courseData.studentName;
        document.getElementById('modalStudentRole').textContent = 'Lớp ' + courseData.classLevel;

        // Status
        const modalStatus = document.getElementById('modalCourseStatus');
        modalStatus.textContent = courseData.status;
        modalStatus.className = 'status ' + this.getCourseStatusClass(courseData.status);

        this.updateCourseModalButtons(courseData.status);
    }

    getCourseStatusClass(status) {
        if (status.includes('Chờ duyệt') || status.includes('Chưa có gia sư')) return 'pending';
        if (status.includes('Đã duyệt') || status.includes('Đang chọn gia sư')) return 'active';
        if (status.includes('Đang diễn ra')) return 'active';
        if (status.includes('Đã hoàn thành')) return 'completed';
        if (status.includes('Đã hủy')) return 'cancelled';
        return 'pending';
    }

    updateCourseModalButtons(status) {
        const cancelBtn = document.getElementById('cancelCourseFromModal');

        // Luôn hiển thị nút xóa
        if (cancelBtn) {
            cancelBtn.style.display = 'inline-flex';
            cancelBtn.innerHTML = '<i class="fas fa-times"></i> Xóa lớp';
        }
    }

    // ===== EDIT COURSE FUNCTIONS =====
    editCourse(courseId) {
        const row = document.querySelector(`tr[data-course-id="${courseId}"]`);
        if (!row) {
            this.showNotification('Không tìm thấy thông tin lớp học', 'error');
            return;
        }

        const courseData = this.extractCourseDataFromRow(row);
        this.populateEditCourseForm(courseData);
        this.showModal('editCourseModal');
    }

    populateEditCourseForm(courseData) {
        // Basic course information
        document.getElementById('editCourseId').value = courseData.id || '';
        document.getElementById('editCourseName').value = courseData.name || '';
        document.getElementById('editCourseSubject').value = this.mapSubjectToValue(courseData.subject) || '';
        document.getElementById('editCourseClass').value = 'Lớp ' + courseData.classLevel || '';
        document.getElementById('editCourseFormat').value = 'online';
        document.getElementById('editCourseDescription').value = courseData.description || '';

        // Schedule & Duration
        document.getElementById('editCourseStartDate').value = this.convertDateFormat(courseData.startDate) || '';
        document.getElementById('editCourseSchedule').value = courseData.schedule || 'T2, T4, T6 - 19:00-21:00';

        // Financial information
        const feeAmount = courseData.fee ? courseData.fee.replace(/[^\d]/g, '') : '';
        document.getElementById('editCourseFee').value = feeAmount;
        document.getElementById('editCourseFeePeriod').value = 'month';

        // Status & Management
        document.getElementById('editCourseStatus').value = this.getCourseStatusClass(courseData.status);
        document.getElementById('editCoursePriority').value = 'normal';
        document.getElementById('editCourseAdminNotes').value = '';
    }

    mapSubjectToValue(subjectText) {
        if (subjectText.includes('Toán')) return 'math';
        if (subjectText.includes('Vật lý')) return 'physics';
        if (subjectText.includes('Hóa')) return 'chemistry';
        if (subjectText.includes('Tiếng Anh')) return 'english';
        if (subjectText.includes('Ngữ văn')) return 'literature';
        if (subjectText.includes('Sinh')) return 'biology';
        if (subjectText.includes('Lịch sử')) return 'history';
        if (subjectText.includes('Địa lý')) return 'geography';
        return '';
    }

    convertDateFormat(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        return '';
    }

    handleEditCourseSubmission() {
        const formData = new FormData(document.getElementById('editCourseForm'));
        const courseData = Object.fromEntries(formData.entries());

        // Validate required fields
        if (!this.validateEditCourseForm(courseData)) {
            return;
        }

        // Show loading state
        const saveButton = document.getElementById('saveEditCourse');
        const originalHTML = saveButton.innerHTML;
        saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
        saveButton.disabled = true;

        // Simulate API call
        setTimeout(() => {
            try {
                // Update the table row with new data
                this.updateCourseRowWithNewData(courseData);

                // Update modal view if it's open
                this.updateCourseModalViewIfOpen(courseData);

                // Close edit modal
                this.closeModal();

                // Show success notification
                this.showNotification('Đã cập nhật thông tin lớp học thành công', 'success');

                // Update statistics
                this.updateStatistics();

            } catch (error) {
                console.error('Error updating course:', error);
                this.showNotification('Có lỗi xảy ra khi cập nhật thông tin', 'error');
            } finally {
                // Restore button state
                saveButton.innerHTML = originalHTML;
                saveButton.disabled = false;
            }
        }, 1500);
    }

    validateEditCourseForm(courseData) {
        const errors = [];

        // Required fields validation
        if (!courseData.courseName || courseData.courseName.trim() === '') {
            errors.push('Tên lớp học không được để trống');
            this.markFieldAsError('editCourseName');
        } else {
            this.markFieldAsValid('editCourseName');
        }

        if (!courseData.subject || courseData.subject === '') {
            errors.push('Vui lòng chọn môn học');
            this.markFieldAsError('editCourseSubject');
        } else {
            this.markFieldAsValid('editCourseSubject');
        }

        if (!courseData.fee || courseData.fee === '') {
            errors.push('Học phí không được để trống');
            this.markFieldAsError('editCourseFee');
        } else {
            this.markFieldAsValid('editCourseFee');
        }

        if (!courseData.status || courseData.status === '') {
            errors.push('Vui lòng chọn trạng thái');
            this.markFieldAsError('editCourseStatus');
        } else {
            this.markFieldAsValid('editCourseStatus');
        }

        // Show errors if any
        if (errors.length > 0) {
            this.showNotification(errors[0], 'error');
            return false;
        }

        return true;
    }

    markFieldAsError(fieldId) {
        const field = document.getElementById(fieldId);
        const formGroup = field?.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('error');
            formGroup.classList.remove('success');
        }
    }

    markFieldAsValid(fieldId) {
        const field = document.getElementById(fieldId);
        const formGroup = field?.closest('.form-group');
        if (formGroup) {
            formGroup.classList.remove('error');
            formGroup.classList.add('success');
        }
    }

    updateCourseRowWithNewData(courseData) {
        const row = document.querySelector(`tr[data-course-id="${courseData.courseId}"]`);
        if (!row) return;

        // Update course name
        const courseNameElement = row.querySelector('.course-name');
        if (courseNameElement) {
            courseNameElement.textContent = courseData.courseName;
        }

        // Update subject
        const subjectElement = row.querySelector('.subject-badge');
        if (subjectElement) {
            const subjectInfo = this.getSubjectInfo(courseData.subject);
            subjectElement.className = `subject-badge ${courseData.subject}`;
            subjectElement.innerHTML = `<i class="${subjectInfo.icon}"></i> ${subjectInfo.name}`;
        }

        // Update status
        const statusElement = row.querySelector('.status');
        if (statusElement) {
            const statusInfo = this.getStatusInfo(courseData.status);
            statusElement.className = `status ${courseData.status}`;
            statusElement.innerHTML = `<i class="${statusInfo.icon}"></i> ${statusInfo.name}`;
        }

        // Update fee
        const feeElement = row.querySelector('.fee-amount');
        if (feeElement) {
            feeElement.textContent = this.formatCurrency(courseData.fee);
        }

        // Update action buttons based on new status
        this.updateCourseActions(row, courseData.status);
    }

    getSubjectInfo(subject) {
        const subjects = {
            'math': { name: 'Toán', icon: 'fas fa-calculator' },
            'physics': { name: 'Vật lý', icon: 'fas fa-atom' },
            'chemistry': { name: 'Hóa học', icon: 'fas fa-flask' },
            'english': { name: 'Tiếng Anh', icon: 'fas fa-language' },
            'literature': { name: 'Ngữ văn', icon: 'fas fa-book' },
            'biology': { name: 'Sinh học', icon: 'fas fa-dna' },
            'history': { name: 'Lịch sử', icon: 'fas fa-landmark' },
            'geography': { name: 'Địa lý', icon: 'fas fa-globe' }
        };
        return subjects[subject] || { name: 'Khác', icon: 'fas fa-book' };
    }

    getStatusInfo(status) {
        const statuses = {
            'pending': { name: 'Chưa có gia sư', icon: 'fas fa-search' },
            'active': { name: 'Đang chọn gia sư', icon: 'fas fa-users' },
            'completed': { name: 'Đã hoàn thành', icon: 'fas fa-check-circle' },
            'cancelled': { name: 'Đã hủy', icon: 'fas fa-times' }
        };
        return statuses[status] || { name: 'Không xác định', icon: 'fas fa-question' };
    }

    updateCourseModalViewIfOpen(courseData) {
        const courseDetailModal = this.elements.courseDetailModal;

        if (courseDetailModal && courseDetailModal.classList.contains('active') &&
            courseDetailModal.dataset.courseId === courseData.courseId) {

            // Update modal content
            const modalCourseName = document.getElementById('modalCourseName');
            const modalCourseFee = document.getElementById('modalCourseFee');
            const modalCourseSubject = document.getElementById('modalCourseSubject');
            const modalCourseStatus = document.getElementById('modalCourseStatus');

            if (modalCourseName) modalCourseName.textContent = courseData.courseName;
            if (modalCourseFee) modalCourseFee.textContent = this.formatCurrency(courseData.fee);
            if (modalCourseSubject) modalCourseSubject.textContent = this.getSubjectInfo(courseData.subject).name;

            if (modalCourseStatus) {
                const statusInfo = this.getStatusInfo(courseData.status);
                modalCourseStatus.textContent = statusInfo.name;
                modalCourseStatus.className = `status ${courseData.status}`;
            }

            // Update modal buttons
            this.updateCourseModalButtons(this.getStatusInfo(courseData.status).name);
        }
    }

    // ===== CANCEL COURSE FUNCTIONS =====
    showCancelCourseModal(courseId) {
        // Store course ID for cancellation
        this.elements.cancelCourseModal.dataset.courseId = courseId;

        // Clear form
        document.getElementById('cancelCourseForm').reset();

        this.showModal('cancelCourseModal');
    }

    handleCancelCourse() {
        const courseId = this.elements.cancelCourseModal.dataset.courseId;
        const reason = document.getElementById('cancelReason').value;
        const note = document.getElementById('cancelNote').value;

        if (!reason) {
            this.showNotification('Vui lòng chọn lý do xóa lớp', 'error');
            return;
        }

        // Show loading state
        const confirmButton = document.getElementById('confirmCancelCourse');
        const originalHTML = confirmButton.innerHTML;
        confirmButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        confirmButton.disabled = true;

        // Simulate API call
        setTimeout(() => {
            try {
                // Update course status
                const row = document.querySelector(`tr[data-course-id="${courseId}"]`);
                if (row) {
                    this.updateCourseStatus(row, 'cancelled');
                    this.updateCourseActions(row, 'cancelled');
                }

                // Close modal
                this.closeModal();

                // Show success notification
                this.showNotification('Đã xóa lớp học thành công', 'success');

                // Update statistics
                this.updateStatistics();

            } catch (error) {
                console.error('Error cancelling course:', error);
                this.showNotification('Có lỗi xảy ra khi xóa lớp học', 'error');
            } finally {
                // Restore button state
                confirmButton.innerHTML = originalHTML;
                confirmButton.disabled = false;
            }
        }, 1500);
    }

    // ===== COURSE STATUS FUNCTIONS =====
    archiveCourse(courseId) {
        const row = document.querySelector(`tr[data-course-id="${courseId}"]`);
        const courseName = row.querySelector('.course-name')?.textContent || '';

        this.showConfirmModal(
            'Xác nhận lưu trữ lớp học',
            `Bạn có chắc chắn muốn lưu trữ lớp học "${courseName}"?`,
            () => {
                row.style.opacity = '0.6';
                this.showNotification('Đã lưu trữ lớp học thành công', 'success');
            }
        );
    }

    updateCourseStatus(row, newStatus) {
        const statusElement = row.querySelector('.status');

        // Remove old status classes
        statusElement.classList.remove('pending', 'active', 'completed', 'cancelled');

        // Add new status class
        statusElement.classList.add(newStatus);

        // Update status text and icon
        const statusInfo = this.getStatusInfo(newStatus);
        statusElement.innerHTML = `<i class="${statusInfo.icon}"></i> ${statusInfo.name}`;
    }

    // ===== MODAL MANAGEMENT =====
    showModal(modalId) {
        const modal = this.elements[modalId];
        if (modal) {
            modal.classList.add('active');
            this.currentModal = modal;
            document.body.style.overflow = 'hidden';

            // Focus management for accessibility
            const firstFocusable = modal.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                setTimeout(() => firstFocusable.focus(), 100);
            }
        }
    }

    closeModal() {
        if (this.currentModal) {
            this.currentModal.classList.remove('active');
            document.body.style.overflow = '';

            // Clear any stored data
            if (this.currentModal.id === 'courseDetailModal') {
                delete this.currentModal.dataset.courseId;
            }
            if (this.currentModal.id === 'cancelCourseModal') {
                delete this.currentModal.dataset.courseId;
            }

            this.currentModal = null;
        }
    }

    showConfirmModal(title, message, onConfirm, type = 'primary') {
        const confirmTitle = document.getElementById('confirmTitle');
        const confirmMessage = document.getElementById('confirmMessage');
        const confirmButton = document.getElementById('confirmAction');

        if (!confirmTitle || !confirmMessage || !confirmButton) {
            console.error('Confirm modal elements not found');
            return;
        }

        // Set content
        confirmTitle.textContent = title;
        confirmMessage.textContent = message;

        // Set button style
        confirmButton.className = `btn btn-${type}`;

        // Remove previous event listeners by cloning the button
        const newConfirmButton = confirmButton.cloneNode(true);
        confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);

        // Add new event listener
        newConfirmButton.addEventListener('click', () => {
            try {
                onConfirm();
            } catch (error) {
                console.error('Error in confirm action:', error);
                this.showNotification('Có lỗi xảy ra, vui lòng thử lại', 'error');
            }
            this.closeModal();
        });

        // Show modal
        this.showModal('confirmModal');
    }

    // ===== PAGINATION =====
    setupPaginationEvents() {
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');
        const pageButtons = document.querySelectorAll('.page-btn:not(#prevPage):not(#nextPage)');
        const pageSize = document.getElementById('pageSize');

        if (prevPage) {
            prevPage.addEventListener('click', () => this.changePage(-1));
        }

        if (nextPage) {
            nextPage.addEventListener('click', () => this.changePage(1));
        }

        pageButtons.forEach(button => {
            if (!isNaN(button.textContent)) {
                button.addEventListener('click', () => this.goToPage(parseInt(button.textContent)));
            }
        });

        if (pageSize) {
            pageSize.addEventListener('change', () => this.changePageSize());
        }
    }

    changePage(direction) {
        const currentPage = document.querySelector('.page-btn.active');
        const currentPageNum = parseInt(currentPage.textContent);
        const newPageNum = currentPageNum + direction;

        if (newPageNum >= 1) {
            this.goToPage(newPageNum);
        }
    }

    goToPage(pageNum) {
        // Remove active class from all page buttons
        document.querySelectorAll('.page-btn').forEach(btn => {
            if (!isNaN(btn.textContent)) {
                btn.classList.remove('active');
            }
        });

        // Add active class to selected page
        const targetButton = Array.from(document.querySelectorAll('.page-btn')).find(btn =>
            parseInt(btn.textContent) === pageNum
        );

        if (targetButton) {
            targetButton.classList.add('active');
        }

        // Update pagination info
        const pageSize = parseInt(document.getElementById('pageSize').value);
        const totalCourses = parseInt(document.getElementById('totalCourses').textContent);
        const startItem = (pageNum - 1) * pageSize + 1;
        const endItem = Math.min(pageNum * pageSize, totalCourses);

        document.getElementById('showingStart').textContent = startItem;
        document.getElementById('showingEnd').textContent = endItem;

        // In real application, would fetch new data here
        this.showNotification(`Đã chuyển đến trang ${pageNum}`, 'info');
    }

    changePageSize() {
        const pageSize = document.getElementById('pageSize').value;
        this.showNotification(`Đã thay đổi hiển thị thành ${pageSize} mục mỗi trang`, 'info');
        // In real application, would reload data with new page size
    }

    updatePaginationInfo(visibleCount) {
        const showingEnd = document.getElementById('showingEnd');
        const totalCourses = document.getElementById('totalCourses');

        if (showingEnd) showingEnd.textContent = visibleCount;
        if (totalCourses) totalCourses.textContent = visibleCount;
    }

    // ===== UTILITY FUNCTIONS =====
    exportCourses() {
        this.showConfirmModal(
            'Xuất báo cáo lớp học',
            'Bạn có muốn xuất báo cáo tất cả lớp học ra file Excel?',
            () => {
                this.showNotification('Đang xuất dữ liệu...', 'info');

                // Simulate export process
                setTimeout(() => {
                    this.showNotification('Đã xuất báo cáo lớp học thành công', 'success');
                }, 2000);
            }
        );
    }

    refreshData() {
        const refreshBtn = this.elements.refreshTable;
        if (!refreshBtn) return;

        this.showNotification('Đang làm mới dữ liệu...', 'info');

        // Add loading animation to button
        const originalHTML = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải...';
        refreshBtn.disabled = true;

        // Simulate refresh
        setTimeout(() => {
            refreshBtn.innerHTML = originalHTML;
            refreshBtn.disabled = false;
            this.showNotification('Đã làm mới dữ liệu thành công', 'success');

            // Reload table data
            this.loadCourses();
            this.updateStatistics();
        }, 1500);
    }

    // ===== STATISTICS UPDATE =====
    updateStatistics() {
        const rows = document.querySelectorAll('#coursesTableBody tr');
        let totalCourses = 0;
        let pendingCourses = 0;
        let activeCourses = 0;
        let completedCourses = 0;

        rows.forEach(row => {
            if (row.style.display !== 'none') {
                totalCourses++;
                const statusElement = row.querySelector('.status');

                if (statusElement.classList.contains('pending')) {
                    pendingCourses++;
                } else if (statusElement.classList.contains('active')) {
                    activeCourses++;
                } else if (statusElement.classList.contains('completed')) {
                    completedCourses++;
                }
            }
        });

        // Update statistics cards
        const totalCoursesElement = document.querySelector('.stat-card:nth-child(1) .stat-number');
        const pendingCoursesElement = document.querySelector('.stat-card:nth-child(2) .stat-number');
        const activeCoursesElement = document.querySelector('.stat-card:nth-child(3) .stat-number');
        const completedCoursesElement = document.querySelector('.stat-card:nth-child(4) .stat-number');

        if (totalCoursesElement) totalCoursesElement.textContent = totalCourses;
        if (pendingCoursesElement) pendingCoursesElement.textContent = pendingCourses;
        if (activeCoursesElement) activeCoursesElement.textContent = activeCourses;
        if (completedCoursesElement) completedCoursesElement.textContent = completedCourses;
    }

    // ===== DATA LOADING =====
    loadCourses() {
        if (!this.elements.coursesTableBody) return;

        this.elements.coursesTableBody.innerHTML = ''; // Clear old data

        const courses = this.generateSampleCourses();

        courses.forEach(course => {
            const row = document.createElement('tr');
            row.setAttribute('data-course-id', course.id);
            row.innerHTML = `
                <td><input type="checkbox" class="course-checkbox"></td>
                <td class="course-name">${course.name}</td>
                <td class="subject-badge ${course.subject}">
                    <i class="${this.getSubjectInfo(course.subject).icon}"></i> ${this.getSubjectInfo(course.subject).name}
                </td>
                <td class="tutor-name">${course.tutor || '—'}</td>
                <td class="student-name">${course.student}</td>
                <td class="status ${course.status}">
                    <i class="${this.getStatusInfo(course.status).icon}"></i> ${this.getStatusInfo(course.status).name}
                </td>
                <td>
                    <span class="fee-amount">${this.formatCurrency(course.fee)}</span>/<span class="fee-period">${course.feePeriod}</span>
                </td>
                <td>${course.createDate}</td>
                <td class="action-buttons">
                    <button class="action-btn view" title="Xem chi tiết" data-course-id="${course.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" title="Chỉnh sửa" data-course-id="${course.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn cancel" title="Xóa lớp" data-course-id="${course.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            `;
            this.elements.coursesTableBody.appendChild(row);
        });

        // Re-initialize checkboxes for new content
        this.setupIndividualCheckboxes();

        // Update statistics and pagination
        this.updateStatistics();
        this.updatePaginationInfo(courses.length);
    }

    generateSampleCourses() {
        return [
            {
                id: 'C101',
                name: 'Lớp Toán 12A1',
                classLeve: 12,
                subject: 'math',
                tutor: 'Nguyễn Văn Minh',
                student: 'Trần Thị Hằng',
                status: 'active',
                fee: 1750000,
                feePeriod: 'tháng',
                createDate: '15/03/2025'
            },
            {
                id: 'C102',
                name: 'Lớp Hóa học 11A2',
                classLeve: 11,
                subject: 'chemistry',
                tutor: 'Lê Thị Thu Hà',
                student: 'Phạm Đức Nam',
                status: 'active',
                fee: 1850000,
                feePeriod: 'tháng',
                createDate: '18/03/2025'
            },
            {
                id: 'C103',
                name: 'Lớp Tiếng Anh 10',
                classLeve: 10,
                subject: 'english',
                tutor: '',
                student: 'Võ Thị Mai',
                status: 'pending',
                fee: 1600000,
                feePeriod: 'tháng',
                createDate: '22/03/2025'
            },
            {
                id: 'C104',
                name: 'Lớp Vật lý 12',
                classLeve: 12,
                subject: 'physics',
                tutor: 'Đặng Phước Khoa',
                student: 'Nguyễn Hoàng Long',
                status: 'active',
                fee: 1900000,
                feePeriod: 'tháng',
                createDate: '25/03/2025'
            },
            {
                id: 'C105',
                name: 'Lớp Ngữ văn 11B',
                classLeve: 11,
                subject: 'literature',
                tutor: '',
                student: 'Lương Thị Lan',
                status: 'pending',
                fee: 1550000,
                feePeriod: 'tháng',
                createDate: '28/03/2025'
            },
            {
                id: 'C106',
                name: 'Lớp Sinh học 10',
                classLeve: 10,
                subject: 'biology',
                tutor: 'Hoàng Minh Tuấn',
                student: 'Bùi Thị Ngọc',
                status: 'completed',
                fee: 1650000,
                feePeriod: 'tháng',
                createDate: '02/04/2025'
            },
            {
                id: 'C107',
                name: 'Lớp Lịch sử 12',
                classLeve: 12,
                subject: 'history',
                tutor: 'Phan Thị Linh',
                student: 'Đỗ Văn Hùng',
                status: 'active',
                fee: 1500000,
                feePeriod: 'tháng',
                createDate: '05/04/2025'
            },
            {
                id: 'C108',
                name: 'Lớp Địa lý 11',
                classLeve: 11,
                subject: 'geography',
                tutor: '',
                student: 'Trịnh Thị Hoa',
                status: 'pending',
                fee: 1700000,
                feePeriod: 'tháng',
                createDate: '08/04/2025'
            },
            {
                id: 'C109',
                name: 'Lớp Toán 10',
                classLeve: 10,
                subject: 'math',
                tutor: 'Vũ Thanh Sơn',
                student: 'Cao Thị Thúy',
                status: 'active',
                fee: 1800000,
                feePeriod: 'tháng',
                createDate: '12/04/2025'
            },
            {
                id: 'C110',
                name: 'Lớp Hóa học 12',
                classLeve: 12,
                subject: 'chemistry',
                tutor: 'Đinh Văn Công',
                student: 'Lê Thị Yến',
                status: 'cancelled',
                fee: 1950000,
                feePeriod: 'tháng',
                createDate: '15/04/2025'
            },
            {
                id: 'C111',
                name: 'Lớp Tiếng Anh giao tiếp',
                classLeve: 13,
                subject: 'english',
                tutor: 'Phạm Thị Xuân',
                student: 'Ngô Văn Tài',
                status: 'active',
                fee: 2000000,
                feePeriod: 'tháng',
                createDate: '20/04/2025'
            },
            {
                id: 'C112',
                name: 'Lớp Vật lý 11',
                classLeve: 11,
                subject: 'physics',
                tutor: '',
                student: 'Tạ Thị Kim',
                status: 'pending',
                fee: 1750000,
                feePeriod: 'tháng',
                createDate: '25/04/2025'
            },
            {
                id: 'C113',
                name: 'Lớp Sinh học 12',
                classLeve: 12,
                subject: 'biology',
                tutor: 'Lý Văn Đức',
                student: 'Dương Thị Phương',
                status: 'active',
                fee: 1600000,
                feePeriod: 'tháng',
                createDate: '28/04/2025'
            },
            {
                id: 'C114',
                name: 'Lớp Ngữ văn 10',
                classLeve: 10,
                subject: 'literature',
                tutor: 'Mai Thị Bích',
                student: 'Lại Văn Cường',
                status: 'completed',
                fee: 1550000,
                feePeriod: 'tháng',
                createDate: '02/05/2025'
            },
            {
                id: 'C115',
                name: 'Lớp Toán nâng cao 12',
                classLeve: 12,
                subject: 'math',
                tutor: '',
                student: 'Huỳnh Thị Thu',
                status: 'pending',
                fee: 1850000,
                feePeriod: 'tháng',
                createDate: '05/05/2025'
            }
        ];
    }

    formatCurrency(amount) {
        if (!amount) return '0 VNĐ';
        return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
    }

    // ===== NOTIFICATION SYSTEM =====
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        const container = document.getElementById('notificationContainer') || document.body;
        container.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto hide after 4 seconds
        setTimeout(() => {
            this.hideNotification(notification);
        }, 4000);

        // Handle close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });
    }

    hideNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'warning': return 'fa-exclamation-triangle';
            case 'danger': return 'fa-exclamation-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'info':
            default: return 'fa-info-circle';
        }
    }

    addNotificationStyles() {
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                #notificationContainer {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10001;
                    pointer-events: none;
                }
                
                .notification {
                    background: #fff;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    transform: translateX(400px);
                    transition: transform 0.3s ease;
                    min-width: 300px;
                    max-width: 400px;
                    pointer-events: auto;
                    position: relative;
                }
                
                .notification.show {
                    transform: translateX(0);
                }
                
                .notification.success {
                    border-left: 4px solid #28a745;
                }
                
                .notification.warning {
                    border-left: 4px solid #ffc107;
                }
                
                .notification.danger, .notification.error {
                    border-left: 4px solid #dc3545;
                }
                
                .notification.info {
                    border-left: 4px solid #17a2b8;
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding-right: 30px;
                }
                
                .notification-content i {
                    font-size: 18px;
                }
                
                .notification.success .notification-content i {
                    color: #28a745;
                }
                
                .notification.warning .notification-content i {
                    color: #ffc107;
                }
                
                .notification.danger .notification-content i,
                .notification.error .notification-content i {
                    color: #dc3545;
                }
                
                .notification.info .notification-content i {
                    color: #17a2b8;
                }
                
                .notification-close {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: none;
                    border: none;
                    font-size: 14px;
                    color: #666;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                }
                
                .notification-close:hover {
                    background: rgba(0,0,0,0.1);
                    color: #333;
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// ===== INITIALIZATION =====
let adminCoursesManager;

document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra xem có phải trang admin courses không
    if (document.querySelector('.admin-courses-management')) {
        adminCoursesManager = new AdminCoursesManager();
    }
});

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminCoursesManager;
}