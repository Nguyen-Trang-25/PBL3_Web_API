// ===== ADMIN COURSES MANAGEMENT JAVASCRIPT - COMPATIBLE WITH EXISTING BE =====
// File: js/admin_courses_compatible.js

class AdminCoursesManager {
    constructor() {
        this.courses = [];
        this.filteredCourses = [];
        this.currentModal = null;
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.selectedCount = 0;
        this.apiBaseUrl = '/api/request'; // Sử dụng endpoint hiện có
        this.isLoading = false;
        this.useerRole;

        // Elements cache
        this.elements = {};

        this.init();
    }

    init() {
        this.cacheElements();
        this.loadCourses();
        this.setupEventListeners();
        this.addNotificationStyles();

        console.log('Admin Courses Manager initialized - Compatible with existing BE');
    }

    // ===== API HELPER METHODS - TƯƠNG THÍCH VỚI BE HIỆN TẠI =====
    async apiRequest(endpoint, options = {}) {
        const url = `${this.apiBaseUrl}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            }
        };

        const config = { ...defaultOptions, ...options };

        if (options.headers) {
            config.headers = { ...defaultOptions.headers, ...options.headers };
        }

        try {
            this.setLoadingState(true);
            const response = await fetch(url, config);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('API Request failed:', error);
            this.showNotification('Lỗi kết nối server: ' + error.message, 'error');
            throw error;
        } finally {
            this.setLoadingState(false);
        }
    }

    setLoadingState(loading) {
        this.isLoading = loading;
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = loading ? 'flex' : 'none';
        }
    }

    // ===== CACHE ELEMENTS =====
    cacheElements() {
        this.elements = {
            selectAllCheckbox: document.getElementById('selectAll'),
            searchInput: document.getElementById('searchCourses'),
            searchBtn: document.getElementById('searchBtn'),
            statusFilter: document.getElementById('statusFilter'),
            subjectFilter: document.getElementById('subjectFilter'),
            applyFiltersBtn: document.getElementById('applyFilters'),
            resetFiltersBtn: document.getElementById('resetFilters'),
            batchActions: document.getElementById('batchActions'),
            batchCancel: document.getElementById('batchCancel'),
            selectedCount: document.getElementById('selectedCount'),
            coursesTableBody: document.getElementById('coursesTableBody'),
            courseDetailModal: document.getElementById('courseDetailModal'),
            editCourseModal: document.getElementById('editCourseModal'),
            cancelCourseModal: document.getElementById('cancelCourseModal'),
            confirmModal: document.getElementById('confirmModal'),
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
        if (this.elements.selectAllCheckbox) {
            this.elements.selectAllCheckbox.addEventListener('change', (e) => {
                this.handleSelectAll(e.target.checked);
            });
        }
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
        document.addEventListener('click', (e) => {
            const target = e.target.closest('.action-btn');
            if (!target) return;

            const courseId = target.dataset.courseId;
            const action = target.classList[1];

            this.handleCourseAction(action, courseId);
        });
    }

    setupModalEvents() {
        const closeButtons = document.querySelectorAll('[id^="close"], [id^="cancel"]');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });

        this.setupModalActionButtons();

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    setupModalActionButtons() {
        const editCourseForm = document.getElementById('editCourseForm');
        if (editCourseForm) {
            editCourseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditCourseSubmission();
            });
        }

        const confirmCancelCourse = document.getElementById('confirmCancelCourse');
        if (confirmCancelCourse) {
            confirmCancelCourse.addEventListener('click', () => this.handleCancelCourse());
        }

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

        // Thêm các button handlers cho modal
        //const cancelCourseFromModal = document.getElementById('cancelCourseFromModal');

        //if (cancelCourseFromModal) {
        //    cancelCourseFromModal.addEventListener('click', () => {
        //        const courseId = this.elements.courseDetailModal?.dataset.courseId;
        //        if (courseId) {
        //            this.closeModal();
        //            this.showCancelCourseModal(courseId);
        //        }
        //    });
        //}
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

    // ===== SEARCH & FILTER - SỬ DỤNG API SEARCH HIỆN CÓ =====
    async performSearch() {
        const searchTerm = this.elements.searchInput?.value.trim() || '';
        const statusFilter = this.elements.statusFilter?.value || '';
        const subjectFilter = this.elements.subjectFilter?.value || '';

        try {
            // Sử dụng endpoint /search có sẵn từ BE
            const params = new URLSearchParams();
            
            if (searchTerm) {
                // Tìm kiếm theo tên môn học
                params.append('subjectName', searchTerm);
            }
            
            if (statusFilter && statusFilter !== 'all') {
                // Có thể cần filter client-side vì API search không hỗ trợ status filter
            }
            
            if (subjectFilter && subjectFilter !== 'all') {
                params.append('subjectName', subjectFilter);
            }

            const response = await this.apiRequest(`/search?${params.toString()}`);
            
            // API trả về array trực tiếp, cần convert sang course format
            this.courses = this.convertRequestsToCourses(response);
            
            // Apply client-side status filter nếu cần
            if (statusFilter && statusFilter !== 'all') {
                this.courses = this.courses.filter(course => course.status === statusFilter);
            }

            this.renderCoursesTable();
            this.updatePaginationInfo(this.courses.length);
            this.updateStatistics();

        } catch (error) {
            console.error('Search failed:', error);
            this.showNotification('Lỗi tìm kiếm, vui lòng thử lại', 'error');
            
            // Fallback: load all courses and filter client-side
            await this.loadCourses();
            this.filterCoursesClientSide(searchTerm, statusFilter, subjectFilter);
        }
    }

    filterCoursesClientSide(searchTerm, statusFilter, subjectFilter) {
        let filtered = [...this.courses];

        if (searchTerm) {
            filtered = filtered.filter(course => 
                course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.tutor_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter && statusFilter !== 'all') {
            filtered = filtered.filter(course => course.status === statusFilter);
        }

        if (subjectFilter && subjectFilter !== 'all') {
            filtered = filtered.filter(course => course.subject === subjectFilter);
        }

        this.filteredCourses = filtered;
        this.renderFilteredCoursesTable();
    }

    async applyFilters() {
        await this.performSearch();
        this.showNotification('Đã áp dụng bộ lọc', 'success');
    }

    async resetFilters() {
        if (this.elements.statusFilter) this.elements.statusFilter.value = 'all';
        if (this.elements.subjectFilter) this.elements.subjectFilter.value = 'all';
        if (this.elements.searchInput) this.elements.searchInput.value = '';
        this.currentPage = 1;

        await this.loadCourses();
        this.showNotification('Đã đặt lại bộ lọc', 'info');
    }

    // ===== BATCH ACTIONS - CLIENT SIDE VÌ BE CHƯA HỖ TRỢ =====
    async performBatchAction(action) {
        const selectedCheckboxes = document.querySelectorAll('.course-checkbox:checked');
        const selectedIds = Array.from(selectedCheckboxes).map(cb => {
            return cb.closest('tr').dataset.courseId;
        });

        if (selectedIds.length === 0) {
            this.showNotification('Vui lòng chọn ít nhất một lớp học', 'warning');
            return;
        }

        let actionText = action === 'cancel' ? 'xóa' : action;
        let confirmMessage = `Bạn có chắc chắn muốn ${actionText} ${selectedIds.length} lớp học đã chọn?`;

        this.showConfirmModal(
            `Xác nhận ${actionText} hàng loạt`,
            confirmMessage,
            () => this.executeBatchAction(action, selectedIds)
        );
    }

    async executeBatchAction(action, courseIds) {
        let successCount = 0;
        let failCount = 0;

        try {
            this.showNotification('Đang xử lý...', 'info');

            // Xử lý từng item một vì BE chưa hỗ trợ batch
            for (const courseId of courseIds) {
                try {
                    await this.apiRequest(`/delete/${courseId}`, {
                        method: 'DELETE'
                    });
                    successCount++;
                } catch (error) {
                    console.error(`Failed to delete ${courseId}:`, error);
                    failCount++;
                }
            }

            // Reset selections
            this.elements.selectAllCheckbox.checked = false;
            const checkboxes = document.querySelectorAll('.course-checkbox:checked');
            checkboxes.forEach(checkbox => checkbox.checked = false);
            this.updateBatchActionsVisibility();

            // Reload data
            await this.loadCourses();

            if (successCount > 0) {
                this.showNotification(`Đã xóa thành công ${successCount} lớp học`, 'success');
            }
            if (failCount > 0) {
                this.showNotification(`Có ${failCount} lớp học không thể xóa`, 'warning');
            }

        } catch (error) {
            console.error('Batch action failed:', error);
            this.showNotification('Có lỗi xảy ra khi xử lý hàng loạt', 'error');
        }
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
        }
    }

    // ===== COURSE DETAIL - SỬ DỤNG API /{id} CÓ SẴN =====
    async showCourseDetail(courseId) {
        try {
            const response = await this.apiRequest(`/${courseId}`);
            
            // Convert response to course format
            const courseData = this.convertRequestToCourse(response);
            
            this.populateCourseDetailModal(courseData);
            this.elements.courseDetailModal.dataset.courseId = courseId;
            this.showModal('courseDetailModal');

        } catch (error) {
            console.error('Failed to load course details:', error);
            this.showNotification('Không thể tải thông tin chi tiết lớp học', 'error');
        }
    }

    populateCourseDetailModal(courseData) {
        // Helper function to safely set element content
        const setElementContent = (id, content) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = content;
            } else {
                console.warn(`Modal element not found: ${id}`);
            }
        };

        setElementContent('modalCourseName', courseData.name);
        setElementContent('modalCourseId', courseData.course_id);
        setElementContent('modalCourseFee', this.formatCurrency(courseData.fee));
        setElementContent('modalCourseSubject', courseData.subject_name);
        setElementContent('modalCourseClass', 'Lớp ' + courseData.class_level);
        setElementContent('modalCourseSchedule', courseData.schedule);
        setElementContent('modalCourseStartDate', this.formatDate(courseData.created_at));

        // Gia sư
        setElementContent('modalTutorName', courseData.tutor_name || 'Chưa có gia sư');
        setElementContent('modalTutorRole', courseData.tutor_name ? 
            'Gia sư ' + courseData.subject_name : 'Đang tìm gia sư');

        // Học viên
        setElementContent('modalStudentName', courseData.student_name);
        setElementContent('modalStudentRole', 'Lớp ' + courseData.class_level);

        // Status
        const modalStatus = document.getElementById('modalCourseStatus');
        if (modalStatus) {
            modalStatus.textContent = this.getStatusText(courseData.status);
            modalStatus.className = 'status ' + this.getCourseStatusClass(courseData.status);
        } else {
            console.warn('Modal status element not found');
        }

        this.updateCourseModalButtons(courseData.status);
    }

    // ===== EDIT COURSE - SỬ DỤNG API UPDATE/{id} CÓ SẴN =====
    async editCourse(courseId) {
        try {
            const response = await this.apiRequest(`/${courseId}`);
            const courseData = this.convertRequestToCourse(response);
            
            this.populateEditCourseForm(courseData);
            this.showModal('editCourseModal');

        } catch (error) {
            console.error('Failed to load course for editing:', error);
            this.showNotification('Không thể tải thông tin lớp học để chỉnh sửa', 'error');
        }
    }

    populateEditCourseForm(courseData) {
        // Helper function to safely set element value
        const setElementValue = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.value = value;
            } else {
                console.warn(`Form element not found: ${id}`);
            }
        };

        setElementValue('editCourseId', courseData.id || '');
        setElementValue('editCourseName', courseData.name || '');
        setElementValue('editCourseSubject', courseData.subject || '');
        setElementValue('editCourseClass', courseData.class_level || '');
        setElementValue('editCourseFormat', courseData.format || 'online');
        setElementValue('editCourseDescription', courseData.description || '');
        setElementValue('editCourseStartDate', this.convertDateFormat(courseData.created_at));
        setElementValue('editCourseSchedule', courseData.schedule || '');
        setElementValue('editCourseFee', courseData.fee || '');
        setElementValue('editCourseFeePeriod', 'month');
        setElementValue('editCourseStatus', courseData.status || 'pending');
        setElementValue('editCoursePriority', 'normal');
        setElementValue('editCourseAdminNotes', '');
    }

    async handleEditCourseSubmission() {
        const formData = new FormData(document.getElementById('editCourseForm'));
        const courseData = Object.fromEntries(formData.entries());

        if (!this.validateEditCourseForm(courseData)) {
            return;
        }

        const saveButton = document.getElementById('saveEditCourse');
        const originalHTML = saveButton.innerHTML;
        saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
        saveButton.disabled = true;

        try {
            // Map form data to API expected format
            const updateData = {
                Fee: parseFloat(courseData.fee) || null,
                Schedule: courseData.schedule,
                Level: courseData.classLevel,
                Location: courseData.location || '',
                Requirement: courseData.description,
                LearningFormat: courseData.format,
                GenderTutor: courseData.genderTutor === 'true'
            };

            await this.apiRequest(`/update/${courseData.courseId}`, {
                method: 'PUT',
                body: JSON.stringify(updateData)
            });

            this.closeModal();
            await this.loadCourses();
            this.showNotification('Đã cập nhật thông tin lớp học thành công', 'success');

        } catch (error) {
            console.error('Error updating course:', error);
            this.showNotification('Có lỗi xảy ra khi cập nhật thông tin', 'error');
        } finally {
            saveButton.innerHTML = originalHTML;
            saveButton.disabled = false;
        }
    }

    validateEditCourseForm(courseData) {
        const errors = [];

        if (!courseData.courseName || courseData.courseName.trim() === '') {
            errors.push('Tên lớp học không được để trống');
            this.markFieldAsError('editCourseName');
        } else {
            this.markFieldAsValid('editCourseName');
        }

        if (!courseData.fee || courseData.fee === '') {
            errors.push('Học phí không được để trống');
            this.markFieldAsError('editCourseFee');
        } else {
            this.markFieldAsValid('editCourseFee');
        }

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

    // ===== CANCEL COURSE - SỬ DỤNG API DELETE/{id} CÓ SẴN =====
    showCancelCourseModal(courseId) {
        this.elements.cancelCourseModal.dataset.courseId = courseId;
        document.getElementById('cancelCourseForm').reset();
        this.showModal('cancelCourseModal');
    }

    async handleCancelCourse() {
        const courseId = this.elements.cancelCourseModal.dataset.courseId;
        const reason = document.getElementById('cancelReason').value;
        const note = document.getElementById('cancelNote').value;

        if (!reason) {
            this.showNotification('Vui lòng chọn lý do xóa lớp', 'error');
            return;
        }

        const confirmButton = document.getElementById('confirmCancelCourse');
        const originalHTML = confirmButton.innerHTML;
        confirmButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        confirmButton.disabled = true;

        try {
            await this.apiRequest(`/delete/${courseId}`, {
                method: 'DELETE'
            });

            this.closeModal();
            await this.loadCourses();
            this.showNotification('Đã xóa lớp học thành công', 'success');

        } catch (error) {
            console.error('Error cancelling course:', error);
            this.showNotification('Có lỗi xảy ra khi xóa lớp học', 'error');
        } finally {
            confirmButton.innerHTML = originalHTML;
            confirmButton.disabled = false;
        }
    }

    // ===== DATA LOADING - SỬ DỤNG API /all CÓ SẴN =====
    async loadCourses() {
        try {
            const response = await this.apiRequest('/all');
            
            // Convert requests to courses format
            this.courses = this.convertRequestsToCourses(response);
            
            this.renderCoursesTable();
            this.updatePaginationInfo(this.courses.length);
            this.updateStatistics();

        } catch (error) {
            console.error('Failed to load courses:', error);
            this.showNotification('Không thể tải danh sách lớp học', 'error');

            this.courses = [];
            this.renderCoursesTable();
        }
    }

    // ===== DATA CONVERSION - CHUYỂN ĐỔI TỪ REQUEST FORMAT SANG COURSE FORMAT =====
    convertRequestsToCourses(requests) {
        if (!Array.isArray(requests)) return [];
        
        return requests.map(request => this.convertRequestToCourse(request));
    }

    convertRequestToCourse(request) {
        return {
            id: request.RequestId || request.requestId,
            name: `Lớp ${request.SubjectName || request.subjectName || 'Unknown'} - ${request.Level || request.level || 'N/A'}`,
            course_id: request.RequestId || request.requestId,
            subject: request.SubjectId || request.subject || 'UNKNOWN',
            subject_name: request.SubjectName || request.subjectName || 'Unknown',
            class_level: request.Level || request.level,
            student_name: request.StudentName || request.studentName || 'N/A',
            student_id: request.StudentId || request.studentId,
            tutor_name: '', // Will be filled from applications if available
            status: request.Status || request.status || 'pending',
            fee: request.Fee || request.fee || 0,
            fee_period: 'tháng',
            schedule: request.Schedule || request.schedule || 'Linh hoạt',
            location: request.Location || request.location || '',
            format: request.LearningFormat || request.learningFormat || 'online',
            gender_tutor: request.GenderTutor || request.genderTutor,
            requirement: request.Requirement || request.requirement || '',
            description: request.Requirement || request.requirement || '',
            created_at: request.CreatedAt || request.createdAt,
            start_date: request.CreatedAt || request.createdAt
        };
    }

    renderCoursesTable() {
        if (!this.elements.coursesTableBody) return;

        this.elements.coursesTableBody.innerHTML = '';

        if (this.courses.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td colspan="9" class="text-center">
                    <div class="empty-state">
                        <i class="fas fa-graduation-cap fa-3x text-muted mb-3"></i>
                        <p class="text-muted">Không có lớp học nào</p>
                    </div>
                </td>
            `;
            this.elements.coursesTableBody.appendChild(emptyRow);
            return;
        }

        // Apply pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedCourses = this.courses.slice(startIndex, endIndex);

        paginatedCourses.forEach(course => {
            const row = document.createElement('tr');
            row.setAttribute('data-course-id', course.id);
            row.innerHTML = `
                <td><input type="checkbox" class="course-checkbox"></td>
                <td class="course-name">${course.name || ''}</td>
                <td class="subject-badge ${course.subject || ''}">
                    <i class="${this.getSubjectInfoFromName(course.subject_name).icon}"></i> 
                    ${this.getSubjectInfoFromName(course.subject_name).name}
                </td>
                <td class="tutor-name">${course.tutor_name || 'Chưa có gia sư'}</td>
                <td class="student-name">${course.student_name || ''}</td>
                <td class="status ${course.status || 'pending'}">
                    <i class="${this.getStatusInfo(course.status || 'pending').icon}"></i> 
                    ${this.getStatusInfo(course.status || 'pending').name}
                </td>
                <td>
                    <span class="fee-amount">${this.formatCurrency(course.fee)}</span>/<span class="fee-period">${course.fee_period || 'tháng'}</span>
                </td>
                <td>${this.formatDate(course.created_at || '')}</td>
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

        this.setupIndividualCheckboxes();
    }

    renderFilteredCoursesTable() {
        if (!this.elements.coursesTableBody) return;

        this.elements.coursesTableBody.innerHTML = '';

        if (this.filteredCourses.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td colspan="9" class="text-center">
                    <div class="empty-state">
                        <i class="fas fa-search fa-3x text-muted mb-3"></i>
                        <p class="text-muted">Không tìm thấy kết quả phù hợp</p>
                    </div>
                </td>
            `;
            this.elements.coursesTableBody.appendChild(emptyRow);
            return;
        }

        this.filteredCourses.forEach(course => {
            const row = document.createElement('tr');
            row.setAttribute('data-course-id', course.id);
            row.innerHTML = `
                <td><input type="checkbox" class="course-checkbox"></td>
                <td class="course-name">${course.name || ''}</td>
                <td class="subject-badge ${course.subject || ''}">
                    <i class="${this.getSubjectInfoFromName(course.subject_name).icon}"></i> 
                    ${this.getSubjectInfoFromName(course.subject_name).name}
                </td>
                <td class="tutor-name">${course.tutor_name || 'Chưa có gia sư'}</td>
                <td class="student-name">${course.student_name || ''}</td>
                <td class="status ${course.status || 'pending'}">
                    <i class="${this.getStatusInfo(course.status || 'pending').icon}"></i> 
                    ${this.getStatusInfo(course.status || 'pending').name}
                </td>
                <td>
                    <span class="fee-amount">${this.formatCurrency(course.fee)}</span>/<span class="fee-period">${course.fee_period || 'tháng'}</span>
                </td>
                <td>${this.formatDate(course.created_at || '')}</td>
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

        this.setupIndividualCheckboxes();
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

    async changePage(direction) {
        const totalPages = Math.ceil(this.courses.length / this.itemsPerPage);
        const newPageNum = this.currentPage + direction;

        if (newPageNum >= 1 && newPageNum <= totalPages) {
            await this.goToPage(newPageNum);
        }
    }

    async goToPage(pageNum) {
        const totalPages = Math.ceil(this.courses.length / this.itemsPerPage);
        
        if (pageNum < 1 || pageNum > totalPages) return;

        this.currentPage = pageNum;
        this.renderCoursesTable();
        this.updatePaginationUI(pageNum);
        this.updatePaginationInfo(this.courses.length);

        this.showNotification(`Đã chuyển đến trang ${pageNum}`, 'info');
    }

    updatePaginationUI(pageNum) {
        document.querySelectorAll('.page-btn').forEach(btn => {
            if (!isNaN(btn.textContent)) {
                btn.classList.remove('active');
            }
        });

        const targetButton = Array.from(document.querySelectorAll('.page-btn')).find(btn =>
            parseInt(btn.textContent) === pageNum
        );

        if (targetButton) {
            targetButton.classList.add('active');
        }
    }

    async changePageSize() {
        const pageSize = parseInt(document.getElementById('pageSize').value);
        this.itemsPerPage = pageSize;
        this.currentPage = 1;

        this.renderCoursesTable();
        this.updatePaginationInfo(this.courses.length);
        this.showNotification(`Đã thay đổi hiển thị thành ${pageSize} mục mỗi trang`, 'info');
    }

    updatePaginationInfo(totalCount) {
        const showingStart = document.getElementById('showingStart');
        const showingEnd = document.getElementById('showingEnd');
        const totalCourses = document.getElementById('totalCourses');

        const startItem = ((this.currentPage - 1) * this.itemsPerPage) + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, totalCount);

        if (showingStart) showingStart.textContent = totalCount > 0 ? startItem : 0;
        if (showingEnd) showingEnd.textContent = endItem;
        if (totalCourses) totalCourses.textContent = totalCount;

        // Update pagination buttons
        this.updatePaginationButtons(Math.ceil(totalCount / this.itemsPerPage));
    }

    updatePaginationButtons(totalPages) {
        const paginationContainer = document.querySelector('.page-buttons');
        if (!paginationContainer) return;

        // Clear existing buttons (except prev/next)
        const existingButtons = paginationContainer.querySelectorAll('.page-btn:not(#prevPage):not(#nextPage)');
        existingButtons.forEach(btn => btn.remove());

        // Add page buttons
        const prevButton = document.getElementById('prevPage');
        const nextButton = document.getElementById('nextPage');

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = `page-btn ${i === this.currentPage ? 'active' : ''}`;
            pageButton.textContent = i;
            pageButton.addEventListener('click', () => this.goToPage(i));

            if (nextButton) {
                paginationContainer.insertBefore(pageButton, nextButton);
            } else {
                paginationContainer.appendChild(pageButton);
            }
        }

        // Update prev/next button states
        if (prevButton) {
            prevButton.disabled = this.currentPage === 1;
        }
        if (nextButton) {
            nextButton.disabled = this.currentPage === totalPages;
        }
    }

    // ===== UTILITY FUNCTIONS =====
    async exportCourses() {
        this.showConfirmModal(
            'Xuất báo cáo lớp học',
            'Bạn có muốn xuất báo cáo tất cả lớp học ra file Excel?',
            () => {
                try {
                    // Since BE doesn't have export endpoint, create CSV client-side
                    this.exportToCSV();
                } catch (error) {
                    console.error('Export failed:', error);
                    this.showNotification('Có lỗi xảy ra khi xuất báo cáo', 'error');
                }
            }
        );
    }

    exportToCSV() {
        const headers = [
            'ID',
            'Tên lớp',
            'Môn học',
            'Gia sư',
            'Học viên',
            'Trạng thái',
            'Học phí',
            'Lịch học',
            'Ngày tạo'
        ];

        const csvContent = [
            headers.join(','),
            ...this.courses.map(course => [
                course.id,
                `"${course.name}"`,
                `"${this.getSubjectInfo(course.subject).name}"`,
                `"${course.tutor_name || 'Chưa có'}"`,
                `"${course.student_name}"`,
                `"${this.getStatusInfo(course.status).name}"`,
                course.fee || 0,
                `"${course.schedule || 'Linh hoạt'}"`,
                `"${this.formatDate(course.created_at)}"`
            ].join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `courses_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showNotification('Đã xuất báo cáo CSV thành công', 'success');
    }

    async refreshData() {
        const refreshBtn = this.elements.refreshTable;
        if (!refreshBtn) return;

        this.showNotification('Đang làm mới dữ liệu...', 'info');

        const originalHTML = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải...';
        refreshBtn.disabled = true;

        try {
            this.currentPage = 1;
            await this.loadCourses();
            this.updateStatistics();

            this.showNotification('Đã làm mới dữ liệu thành công', 'success');

        } catch (error) {
            console.error('Refresh failed:', error);
            this.showNotification('Có lỗi xảy ra khi làm mới dữ liệu', 'error');
        } finally {
            refreshBtn.innerHTML = originalHTML;
            refreshBtn.disabled = false;
        }
    }

    // ===== STATISTICS UPDATE - CLIENT SIDE =====
    updateStatistics() {
        let totalCourses = 0;
        let pendingCourses = 0;
        let activeCourses = 0;
        let completedCourses = 0;

        this.courses.forEach(course => {
            totalCourses++;
            switch (course.status) {
                case 'pending':
                case 'waiting':
                    pendingCourses++;
                    break;
                case 'active':
                case 'approved':
                    activeCourses++;
                    break;
                case 'completed':
                case 'finished':
                    completedCourses++;
                    break;
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

    // ===== HELPER METHODS =====
    formatDate(dateString) {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (error) {
            console.error('Date formatting error:', error);
            return dateString;
        }
    }

    formatCurrency(amount) {
        if (!amount) return '0 VNĐ';
        const numAmount = typeof amount === 'string' ? parseInt(amount.replace(/[^\d]/g, '')) : amount;
        if (isNaN(numAmount)) return '0 VNĐ';
        
        return new Intl.NumberFormat('vi-VN').format(numAmount) + ' VNĐ';
    }

    convertDateFormat(dateStr) {
        if (!dateStr) return '';

        try {
            if (dateStr.includes('/')) {
                const parts = dateStr.split('/');
                if (parts.length === 3) {
                    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
            }

            if (dateStr.includes('T')) {
                return dateStr.split('T')[0];
            }

            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }

            return dateStr;
        } catch (error) {
            console.error('Date conversion error:', error);
            return '';
        }
    }

    getSubjectInfoFromName(subjectName) {
        console.log('Getting subject info from name:', subjectName);
        
        if (!subjectName) return { name: 'Khác', icon: 'fas fa-book' };
        
        const name = subjectName.toLowerCase().trim();
        
        if (name.includes('toán')) return { name: 'Toán', icon: 'fas fa-calculator' };
        if (name.includes('vật lý')) return { name: 'Vật lý', icon: 'fas fa-atom' };
        if (name.includes('hóa')) return { name: 'Hóa học', icon: 'fas fa-flask' };
        if (name.includes('anh')) return { name: 'Tiếng Anh', icon: 'fas fa-language' };
        if (name.includes('văn')) return { name: 'Ngữ văn', icon: 'fas fa-book' };
        if (name.includes('sinh')) return { name: 'Sinh học', icon: 'fas fa-dna' };
        if (name.includes('lịch sử')) return { name: 'Lịch sử', icon: 'fas fa-landmark' };
        if (name.includes('địa lý')) return { name: 'Địa lý', icon: 'fas fa-globe' };
        
        // Fallback: return original name
        return { name: subjectName, icon: 'fas fa-book' };
    }

    getSubjectInfo(subject) {
        // Log để debug
        console.log('Getting subject info for:', subject);
        
        const subjects = {
            'MAT': { name: 'Toán', icon: 'fas fa-calculator' },
            'PHY': { name: 'Vật lý', icon: 'fas fa-atom' },
            'CHE': { name: 'Hóa học', icon: 'fas fa-flask' },
            'ENG': { name: 'Tiếng Anh', icon: 'fas fa-language' },
            'LIT': { name: 'Ngữ văn', icon: 'fas fa-book' },
            'BIO': { name: 'Sinh học', icon: 'fas fa-dna' },
            'HIS': { name: 'Lịch sử', icon: 'fas fa-landmark' },
            'GEO': { name: 'Địa lý', icon: 'fas fa-globe' },
            'math': { name: 'Toán', icon: 'fas fa-calculator' },
            'physics': { name: 'Vật lý', icon: 'fas fa-atom' },
            'chemistry': { name: 'Hóa học', icon: 'fas fa-flask' },
            'english': { name: 'Tiếng Anh', icon: 'fas fa-language' },
            'literature': { name: 'Ngữ văn', icon: 'fas fa-book' },
            'biology': { name: 'Sinh học', icon: 'fas fa-dna' },
            'history': { name: 'Lịch sử', icon: 'fas fa-landmark' },
            'geography': { name: 'Địa lý', icon: 'fas fa-globe' },
            'UNKNOWN': { name: 'Khác', icon: 'fas fa-book' }
        };
        
        return subjects[subject] || { name: subject || 'Khác', icon: 'fas fa-book' };
    }

    getStatusInfo(status) {
        const statuses = {
            'pending': { name: 'Chưa có ứng viên', icon: 'fas fa-clock' },
            'applied': { name: 'Đã có ứng viên', icon: 'fas fa-user-check' },
            'active': { name: 'Đang học', icon: 'fas fa-play-circle' },
            'completed': { name: 'Đã hoàn thành', icon: 'fas fa-check-circle' },
            'cancel': { name: 'Đã hủy', icon: 'fas fa-trash' }
        };
        return statuses[status] || { name: 'Không xác định', icon: 'fas fa-question' };
    }

    getStatusText(status) {
        return this.getStatusInfo(status).name;
    }

    getCourseStatusClass(status) {
        if (!status) return 'pending';
        
        const statusLower = status.toLowerCase();
        if (statusLower === 'pending') return 'pending';
        if (statusLower === 'applied') return 'applied';
        if (statusLower === 'active') return 'active';
        if (statusLower === 'completed') return 'completed';
        if (statusLower === 'cancelled') return 'cancelled';
        
        // Fallback cho các trạng thái cũ
        if (statusLower.includes('waiting')) return 'pending';
        if (statusLower.includes('approved')) return 'active';
        if (statusLower.includes('finished')) return 'completed';
        if (statusLower.includes('deleted')) return 'cancelled';
        
        return 'pending';
    }

    updateCourseModalButtons(status) {
        const editBtn = document.getElementById('editCourseFromModal');
        const cancelBtn = document.getElementById('cancelCourseFromModal');

        if (editBtn) {
            editBtn.style.display = ['pending', 'waiting', 'approved'].includes(status) ? 'inline-flex' : 'none';
        } else {
            console.warn('Edit button not found in modal');
        }

        if (cancelBtn) {
            cancelBtn.style.display = status !== 'deleted' ? 'inline-flex' : 'none';
            cancelBtn.innerHTML = '<i class="fas fa-times"></i> Xóa lớp';
        } else {
            console.warn('Cancel button not found in modal');
        }
    }

    // ===== MODAL MANAGEMENT =====
    showModal(modalId) {
        const modal = this.elements[modalId];
        if (modal) {
            modal.classList.add('active');
            this.currentModal = modal;
            document.body.style.overflow = 'hidden';

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

        confirmTitle.textContent = title;
        confirmMessage.textContent = message;
        confirmButton.className = `btn btn-${type}`;

        const newConfirmButton = confirmButton.cloneNode(true);
        confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);

        newConfirmButton.addEventListener('click', () => {
            try {
                onConfirm();
            } catch (error) {
                console.error('Error in confirm action:', error);
                this.showNotification('Có lỗi xảy ra, vui lòng thử lại', 'error');
            }
            this.closeModal();
        });

        this.showModal('confirmModal');
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

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        const duration = type === 'error' ? 6000 : 4000;
        setTimeout(() => {
            this.hideNotification(notification);
        }, duration);

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

                .empty-state {
                    padding: 40px 20px;
                    text-align: center;
                }

                .empty-state i {
                    opacity: 0.3;
                }

                #loadingOverlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: none;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                }

                .loading-spinner {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                }

                .loading-spinner i {
                    font-size: 24px;
                    color: #007bff;
                    margin-bottom: 10px;
                }

                .form-group.error input,
                .form-group.error select,
                .form-group.error textarea {
                    border-color: #dc3545;
                }

                .form-group.success input,
                .form-group.success select,
                .form-group.success textarea {
                    border-color: #28a745;
                }

                .action-btn {
                    background: none;
                    border: 1px solid #ddd;
                    padding: 6px 8px;
                    margin: 0 2px;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .action-btn:hover {
                    background: #f8f9fa;
                    border-color: #007bff;
                    color: #007bff;
                }

                .action-btn.view:hover {
                    border-color: #17a2b8;
                    color: #17a2b8;
                }

                .action-btn.edit:hover {
                    border-color: #28a745;
                    color: #28a745;
                }

                .action-btn.cancel:hover {
                    border-color: #dc3545;
                    color: #dc3545;
                }

                .status {
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 500;
                    text-align: center;
                    white-space: nowrap;
                }

                .status.pending {
                    background: #fff3cd;
                    color: #856404;
                    border: 1px solid #ffeaa7;
                }

                .status.applied {
                    background: #d1ecf1;
                    color: #0c5460;
                    border: 1px solid #bee5eb;
                }

                .status.active {
                    background: #d4edda;
                    color: #155724;
                    border: 1px solid #c3e6cb;
                }

                .status.completed {
                    background: #e2e3e5;
                    color: #383d41;
                    border: 1px solid #d6d8db;
                }

                .status.cancelled {
                    background: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }

                .subject-badge {
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 500;
                    text-align: center;
                    white-space: nowrap;
                    background: #e9ecef;
                    color: #495057;
                    border: 1px solid #dee2e6;
                }

                .subject-badge i {
                    margin-right: 4px;
                }

                @media (max-width: 768px) {
                    .notification {
                        max-width: calc(100vw - 40px);
                        min-width: calc(100vw - 40px);
                    }
                    
                    .action-buttons {
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                    }
                    
                    .action-btn {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Add required DOM elements
        if (!document.getElementById('loadingOverlay')) {
            const loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'loadingOverlay';
            loadingOverlay.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <div>Đang tải...</div>
                </div>
            `;
            document.body.appendChild(loadingOverlay);
        }

        if (!document.getElementById('notificationContainer')) {
            const notificationContainer = document.createElement('div');
            notificationContainer.id = 'notificationContainer';
            document.body.appendChild(notificationContainer);
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

// Global error handlers
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (adminCoursesManager) {
        adminCoursesManager.showNotification('Có lỗi không mong muốn xảy ra', 'error');
    }
});

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (adminCoursesManager) {
        adminCoursesManager.showNotification('Có lỗi hệ thống xảy ra', 'error');
    }
});