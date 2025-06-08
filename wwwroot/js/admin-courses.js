// Admin Courses Management JavaScript - Simplified Version

document.addEventListener("DOMContentLoaded", function () {
    initializeCoursesManagement();
});

function initializeCoursesManagement() {
    // Initialize all components
    initializeCheckboxes();
    initializeSearch();
    initializeFilters();
    initializeBatchActions();
    initializeCourseActions();
    initializeModals();
    initializePagination();
    initializeEditCourseModal();
    initializeCancelCourseModal();

    // Load course data
    loadCourses();

    // Add notification styles
    addNotificationStyles();
}

// Checkbox Management
function initializeCheckboxes() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const courseCheckboxes = document.querySelectorAll('.course-checkbox');

    // Select all functionality
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function () {
            courseCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            updateBatchActionsVisibility();
            updateSelectedCount();
        });
    }

    // Individual checkbox functionality
    courseCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            updateSelectAllState();
            updateBatchActionsVisibility();
            updateSelectedCount();
        });
    });
}

function updateSelectAllState() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const courseCheckboxes = document.querySelectorAll('.course-checkbox');
    const checkedCheckboxes = document.querySelectorAll('.course-checkbox:checked');

    if (checkedCheckboxes.length === courseCheckboxes.length) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else if (checkedCheckboxes.length === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    }
}

function updateSelectedCount() {
    const selectedCount = document.querySelectorAll('.course-checkbox:checked').length;
    const countElement = document.getElementById('selectedCount');
    if (countElement) {
        countElement.textContent = selectedCount;
    }
}

function updateBatchActionsVisibility() {
    const selectedCount = document.querySelectorAll('.course-checkbox:checked').length;
    const batchActions = document.getElementById('batchActions');

    if (batchActions) {
        batchActions.style.display = selectedCount > 0 ? 'flex' : 'none';
    }
}

// Search Functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchCourses');
    const searchBtn = document.getElementById('searchBtn');

    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('keyup', function (e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        // Real-time search with debounce
        let searchTimeout;
        searchInput.addEventListener('input', function () {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(performSearch, 500);
        });
    }
}

function performSearch() {
    const searchTerm = document.getElementById('searchCourses').value.toLowerCase().trim();
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

    updatePaginationInfo(visibleCount);
}

// Filter Functionality
function initializeFilters() {
    const applyFiltersBtn = document.getElementById('applyFilters');
    const resetFiltersBtn = document.getElementById('resetFilters');

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetFilters);
    }
}

function applyFilters() {
    const statusFilter = document.getElementById('statusFilter').value;
    const subjectFilter = document.getElementById('subjectFilter').value;
    const levelFilter = document.getElementById('levelFilter').value;
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

        // Level filter (would need additional data attribute or content checking)
        if (levelFilter !== 'all') {
            // Implement level filtering logic here
            // For now, showing all rows
        }

        if (showRow) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    updatePaginationInfo(visibleCount);
    showNotification('Đã áp dụng bộ lọc', 'success');
}

function resetFilters() {
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('subjectFilter').value = 'all';
    document.getElementById('levelFilter').value = 'all';
    document.getElementById('searchCourses').value = '';

    const rows = document.querySelectorAll('#coursesTableBody tr');
    rows.forEach(row => {
        row.style.display = '';
    });

    updatePaginationInfo(rows.length);
    showNotification('Đã đặt lại bộ lọc', 'info');
}

// Batch Actions
function initializeBatchActions() {
    const batchApprove = document.getElementById('batchApprove');
    const batchPause = document.getElementById('batchPause');
    const batchCancel = document.getElementById('batchCancel');

    if (batchApprove) {
        batchApprove.addEventListener('click', () => performBatchAction('approve'));
    }

    if (batchPause) {
        batchPause.addEventListener('click', () => performBatchAction('pause'));
    }

    if (batchCancel) {
        batchCancel.addEventListener('click', () => performBatchAction('cancel'));
    }
}

function performBatchAction(action) {
    const selectedCheckboxes = document.querySelectorAll('.course-checkbox:checked');
    const selectedCount = selectedCheckboxes.length;

    if (selectedCount === 0) {
        showNotification('Vui lòng chọn ít nhất một lớp học', 'warning');
        return;
    }

    let actionText = '';
    let confirmMessage = '';

    switch (action) {
        case 'approve':
            actionText = 'duyệt';
            confirmMessage = `Bạn có chắc chắn muốn duyệt ${selectedCount} lớp học đã chọn?`;
            break;
        case 'pause':
            actionText = 'tạm dừng';
            confirmMessage = `Bạn có chắc chắn muốn tạm dừng ${selectedCount} lớp học đã chọn?`;
            break;
        case 'cancel':
            actionText = 'hủy';
            confirmMessage = `Bạn có chắc chắn muốn hủy ${selectedCount} lớp học đã chọn?`;
            break;
    }

    showConfirmModal(
        `Xác nhận ${actionText} hàng loạt`,
        confirmMessage,
        () => executeBatchAction(action, selectedCheckboxes)
    );
}

function executeBatchAction(action, checkboxes) {
    // Simulate API call
    showNotification('Đang xử lý...', 'info');

    setTimeout(() => {
        checkboxes.forEach(checkbox => {
            const row = checkbox.closest('tr');

            switch (action) {
                case 'approve':
                    updateCourseStatus(row, 'approved');
                    updateCourseActions(row, 'approved');
                    break;
                case 'pause':
                    updateCourseStatus(row, 'paused');
                    updateCourseActions(row, 'paused');
                    break;
                case 'cancel':
                    updateCourseStatus(row, 'cancelled');
                    updateCourseActions(row, 'cancelled');
                    break;
            }
        });

        // Reset selections
        document.getElementById('selectAll').checked = false;
        checkboxes.forEach(checkbox => checkbox.checked = false);
        updateBatchActionsVisibility();

        showNotification(`Đã ${actionText} thành công ${checkboxes.length} lớp học`, 'success');
    }, 1500);
}

// Course Actions
function initializeCourseActions() {
    document.addEventListener('click', function (e) {
        if (e.target.closest('.action-btn.view')) {
            const courseId = e.target.closest('.action-btn').dataset.courseId;
            showCourseDetail(courseId);
        }

        if (e.target.closest('.action-btn.approve')) {
            const courseId = e.target.closest('.action-btn').dataset.courseId;
            approveCourse(courseId);
        }

        if (e.target.closest('.action-btn.edit')) {
            const courseId = e.target.closest('.action-btn').dataset.courseId;
            editCourse(courseId);
        }

        if (e.target.closest('.action-btn.pause')) {
            const courseId = e.target.closest('.action-btn').dataset.courseId;
            pauseCourse(courseId);
        }

        if (e.target.closest('.action-btn.cancel')) {
            const courseId = e.target.closest('.action-btn').dataset.courseId;
            showCancelCourseModal(courseId);
        }

        if (e.target.closest('.action-btn.archive')) {
            const courseId = e.target.closest('.action-btn').dataset.courseId;
            archiveCourse(courseId);
        }
    });
}

// ===== COURSE DETAIL FUNCTIONS =====

function showCourseDetail(courseId) {
    const row = document.querySelector(`tr[data-course-id="${courseId}"]`);
    if (!row) return;

    const courseData = extractCourseDataFromRow(row);
    populateCourseDetailModal(courseData);

    // Store course ID for modal actions
    document.getElementById('courseDetailModal').dataset.courseId = courseId;

    // Show modal
    showModal('courseDetailModal');
}

function extractCourseDataFromRow(row) {
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
        level: 'THPT',
        format: 'Online',
        startDate: '20/11/2024',
        description: 'Lớp học ôn thi THPT quốc gia môn Toán'
    };
}

function populateCourseDetailModal(courseData) {
    document.getElementById('modalCourseName').textContent = courseData.name;
    document.getElementById('modalCourseId').textContent = courseData.courseId;
    document.getElementById('modalCourseFee').textContent = courseData.fee;
    document.getElementById('modalCourseSubject').textContent = courseData.subject;
    document.getElementById('modalCourseStartDate').textContent = courseData.startDate;

    // NEW: Gia sư
    document.getElementById('modalTutorName').textContent = courseData.tutorName;
    document.getElementById('modalTutorRole').textContent = 'Gia sư ' + courseData.subject;

    document.getElementById('modalStudentName').textContent = courseData.studentName;
    document.getElementById('modalStudentRole').textContent = courseData.studentGrade;


    // Status
    const modalStatus = document.getElementById('modalCourseStatus');
    modalStatus.textContent = courseData.status;
    modalStatus.className = 'status ' + getCourseStatusClass(courseData.status);

    updateCourseModalButtons(courseData.status);
}


function getCourseStatusClass(status) {
    if (status.includes('Chờ duyệt')) return 'pending';
    if (status.includes('Đã duyệt')) return 'approved';
    if (status.includes('Đang diễn ra')) return 'active';
    if (status.includes('Đã hoàn thành')) return 'completed';
    if (status.includes('Đã hủy')) return 'cancelled';
    if (status.includes('Tạm dừng')) return 'paused';
    return 'pending';
}

function updateCourseModalButtons(status) {
    const approveBtn = document.getElementById('approveCourseFromModal');
    const pauseBtn = document.getElementById('pauseCourseFromModal');
    const cancelBtn = document.getElementById('cancelCourseFromModal');

    // Hide all buttons first
    if (approveBtn) approveBtn.style.display = 'none';
    if (pauseBtn) pauseBtn.style.display = 'none';
    if (cancelBtn) cancelBtn.style.display = 'inline-flex';

    if (status.includes('Chờ duyệt')) {
        if (approveBtn) approveBtn.style.display = 'inline-flex';
        if (pauseBtn) pauseBtn.style.display = 'none';
    } else if (status.includes('Đang diễn ra')) {
        if (pauseBtn) {
            pauseBtn.style.display = 'inline-flex';
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Tạm dừng';
            pauseBtn.className = 'btn btn-warning';
        }
    } else if (status.includes('Tạm dừng')) {
        if (pauseBtn) {
            pauseBtn.style.display = 'inline-flex';
            pauseBtn.innerHTML = '<i class="fas fa-play"></i> Tiếp tục';
            pauseBtn.className = 'btn btn-success';
        }
    }
}

// ===== EDIT COURSE FUNCTIONS =====

function editCourse(courseId) {
    const row = document.querySelector(`tr[data-course-id="${courseId}"]`);
    if (!row) {
        showNotification('Không tìm thấy thông tin lớp học', 'error');
        return;
    }

    const courseData = extractCourseDataFromRow(row);
    populateEditCourseForm(courseData);
    showModal('editCourseModal');
}

function initializeEditCourseModal() {
    const editCourseModal = document.getElementById('editCourseModal');
    const closeEditCourse = document.getElementById('closeEditCourse');
    const cancelEditCourse = document.getElementById('cancelEditCourse');
    const editCourseForm = document.getElementById('editCourseForm');

    // Close modal handlers
    if (closeEditCourse) {
        closeEditCourse.addEventListener('click', () => hideModal('editCourseModal'));
    }

    if (cancelEditCourse) {
        cancelEditCourse.addEventListener('click', () => hideModal('editCourseModal'));
    }

    // Form submission handler
    if (editCourseForm) {
        editCourseForm.addEventListener('submit', function (e) {
            e.preventDefault();
            handleEditCourseSubmission();
        });
    }

    // Close modal when clicking outside
    if (editCourseModal) {
        editCourseModal.addEventListener('click', function (e) {
            if (e.target === this) {
                hideModal('editCourseModal');
            }
        });
    }

    // Form validation
    setupEditCourseFormValidation();
}

function populateEditCourseForm(courseData) {
    // Basic course information
    document.getElementById('editCourseId').value = courseData.id || '';
    document.getElementById('editCourseName').value = courseData.name || '';
    document.getElementById('editCourseSubject').value = mapSubjectToValue(courseData.subject) || '';
    document.getElementById('editCourseLevel').value = mapLevelToValue(courseData.level) || '';
    document.getElementById('editCourseFormat').value = 'online';
    document.getElementById('editCourseDescription').value = courseData.description || '';

    // Schedule & Duration
    document.getElementById('editCourseStartDate').value = convertDateFormat(courseData.startDate) || '';
    document.getElementById('editCourseSchedule').value = courseData.schedule || '';

    // Financial information
    const feeAmount = courseData.fee ? courseData.fee.replace(/[^\d]/g, '') : '';
    document.getElementById('editCourseFee').value = feeAmount;
    document.getElementById('editCourseFeePeriod').value = 'month';

    // Status & Management
    document.getElementById('editCourseStatus').value = getCourseStatusClass(courseData.status);
    document.getElementById('editCoursePriority').value = 'normal';
    document.getElementById('editCourseAdminNotes').value = '';
}

function mapSubjectToValue(subjectText) {
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

function mapLevelToValue(levelText) {
    if (levelText.includes('THPT')) return 'senior';
    if (levelText.includes('THCS')) return 'junior';
    if (levelText.includes('Tiểu học')) return 'elementary';
    if (levelText.includes('Đại học')) return 'university';
    return '';
}

function convertDateFormat(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return '';
}

function handleEditCourseSubmission() {
    const formData = new FormData(document.getElementById('editCourseForm'));
    const courseData = Object.fromEntries(formData.entries());

    // Validate required fields
    if (!validateEditCourseForm(courseData)) {
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
            updateCourseRowWithNewData(courseData);

            // Update modal view if it's open
            updateCourseModalViewIfOpen(courseData);

            // Close edit modal
            hideModal('editCourseModal');

            // Show success notification
            showNotification('Đã cập nhật thông tin lớp học thành công', 'success');

        } catch (error) {
            console.error('Error updating course:', error);
            showNotification('Có lỗi xảy ra khi cập nhật thông tin', 'error');
        } finally {
            // Restore button state
            saveButton.innerHTML = originalHTML;
            saveButton.disabled = false;
        }
    }, 1500);
}

function validateEditCourseForm(courseData) {
    const errors = [];

    // Required fields validation
    if (!courseData.courseName || courseData.courseName.trim() === '') {
        errors.push('Tên lớp học không được để trống');
        markFieldAsError('editCourseName');
    } else {
        markFieldAsValid('editCourseName');
    }

    if (!courseData.subject || courseData.subject === '') {
        errors.push('Vui lòng chọn môn học');
        markFieldAsError('editCourseSubject');
    } else {
        markFieldAsValid('editCourseSubject');
    }

    if (!courseData.level || courseData.level === '') {
        errors.push('Vui lòng chọn cấp độ');
        markFieldAsError('editCourseLevel');
    } else {
        markFieldAsValid('editCourseLevel');
    }

    if (!courseData.fee || courseData.fee === '') {
        errors.push('Học phí không được để trống');
        markFieldAsError('editCourseFee');
    } else {
        markFieldAsValid('editCourseFee');
    }

    if (!courseData.status || courseData.status === '') {
        errors.push('Vui lòng chọn trạng thái');
        markFieldAsError('editCourseStatus');
    } else {
        markFieldAsValid('editCourseStatus');
    }

    // Show errors if any
    if (errors.length > 0) {
        showNotification(errors[0], 'error');
        return false;
    }

    return true;
}

function markFieldAsError(fieldId) {
    const field = document.getElementById(fieldId);
    const formGroup = field?.closest('.form-group');
    if (formGroup) {
        formGroup.classList.add('error');
        formGroup.classList.remove('success');
    }
}

function markFieldAsValid(fieldId) {
    const field = document.getElementById(fieldId);
    const formGroup = field?.closest('.form-group');
    if (formGroup) {
        formGroup.classList.remove('error');
        formGroup.classList.add('success');
    }
}

function updateCourseRowWithNewData(courseData) {
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
        const subjectInfo = getSubjectInfo(courseData.subject);
        subjectElement.className = `subject-badge ${courseData.subject}`;
        subjectElement.innerHTML = `<i class="${subjectInfo.icon}"></i> ${subjectInfo.name}`;
    }

    // Update status
    const statusElement = row.querySelector('.status');
    if (statusElement) {
        const statusInfo = getStatusInfo(courseData.status);
        statusElement.className = `status ${courseData.status}`;
        statusElement.innerHTML = `<i class="${statusInfo.icon}"></i> ${statusInfo.name}`;
    }

    // Update fee
    const feeElement = row.querySelector('.fee-amount');
    if (feeElement) {
        feeElement.textContent = formatCurrency(courseData.fee);
    }

    // Update action buttons based on new status
    updateCourseActions(row, courseData.status);
}

function getSubjectInfo(subject) {
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

function getStatusInfo(status) {
    const statuses = {
        'pending': { name: 'Chờ duyệt', icon: 'fas fa-clock' },
        'approved': { name: 'Đã duyệt', icon: 'fas fa-check' },
        'active': { name: 'Đang diễn ra', icon: 'fas fa-play-circle' },
        'completed': { name: 'Đã hoàn thành', icon: 'fas fa-check-circle' },
        'paused': { name: 'Tạm dừng', icon: 'fas fa-pause' },
        'cancelled': { name: 'Đã hủy', icon: 'fas fa-times' }
    };
    return statuses[status] || { name: 'Không xác định', icon: 'fas fa-question' };
}

function formatCurrency(amount) {
    if (!amount) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
}

function updateCourseModalViewIfOpen(courseData) {
    const courseDetailModal = document.getElementById('courseDetailModal');

    if (courseDetailModal && courseDetailModal.classList.contains('active') &&
        courseDetailModal.dataset.courseId === courseData.courseId) {

        // Update modal content
        const modalCourseName = document.getElementById('modalCourseName');
        const modalCourseFee = document.getElementById('modalCourseFee');
        const modalCourseSubject = document.getElementById('modalCourseSubject');
        const modalCourseStatus = document.getElementById('modalCourseStatus');

        if (modalCourseName) modalCourseName.textContent = courseData.courseName;
        if (modalCourseFee) modalCourseFee.textContent = formatCurrency(courseData.fee);
        if (modalCourseSubject) modalCourseSubject.textContent = getSubjectInfo(courseData.subject).name;

        if (modalCourseStatus) {
            const statusInfo = getStatusInfo(courseData.status);
            modalCourseStatus.textContent = statusInfo.name;
            modalCourseStatus.className = `status ${courseData.status}`;
        }

        // Update modal buttons
        updateCourseModalButtons(getStatusInfo(courseData.status).name);
    }
}

function setupEditCourseFormValidation() {
    const form = document.getElementById('editCourseForm');
    if (!form) return;

    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function () {
            validateSingleCourseField(this);
        });

        input.addEventListener('input', function () {
            // Remove error styling while typing
            const formGroup = this.closest('.form-group');
            if (formGroup && formGroup.classList.contains('error')) {
                formGroup.classList.remove('error');
            }
        });
    });
}

function validateSingleCourseField(field) {
    const fieldName = field.name;
    const fieldValue = field.value.trim();

    switch (fieldName) {
        case 'courseName':
            if (!fieldValue) {
                markFieldAsError(field.id);
                return false;
            }
            break;
        case 'subject':
        case 'level':
        case 'status':
            if (!fieldValue) {
                markFieldAsError(field.id);
                return false;
            }
            break;
        case 'fee':
            if (!fieldValue || isNaN(fieldValue) || fieldValue <= 0) {
                markFieldAsError(field.id);
                return false;
            }
            break;
    }

    markFieldAsValid(field.id);
    return true;
}

// ===== CANCEL COURSE FUNCTIONS =====

function initializeCancelCourseModal() {
    const closeCancelCourse = document.getElementById('closeCancelCourse');
    const cancelCancelCourse = document.getElementById('cancelCancelCourse');
    const confirmCancelCourse = document.getElementById('confirmCancelCourse');
    const cancelCourseForm = document.getElementById('cancelCourseForm');

    if (closeCancelCourse) {
        closeCancelCourse.addEventListener('click', () => hideModal('cancelCourseModal'));
    }

    if (cancelCancelCourse) {
        cancelCancelCourse.addEventListener('click', () => hideModal('cancelCourseModal'));
    }

    if (confirmCancelCourse) {
        confirmCancelCourse.addEventListener('click', handleCancelCourse);
    }
}

function showCancelCourseModal(courseId) {
    // Store course ID for cancellation
    document.getElementById('cancelCourseModal').dataset.courseId = courseId;

    // Clear form
    document.getElementById('cancelCourseForm').reset();

    showModal('cancelCourseModal');
}

function handleCancelCourse() {
    const courseId = document.getElementById('cancelCourseModal').dataset.courseId;
    const reason = document.getElementById('cancelReason').value;
    const note = document.getElementById('cancelNote').value;

    if (!reason) {
        showNotification('Vui lòng chọn lý do hủy lớp', 'error');
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
                updateCourseStatus(row, 'cancelled');
                updateCourseActions(row, 'cancelled');
            }

            // Close modal
            hideModal('cancelCourseModal');

            // Show success notification
            showNotification('Đã hủy lớp học thành công', 'success');

        } catch (error) {
            console.error('Error cancelling course:', error);
            showNotification('Có lỗi xảy ra khi hủy lớp học', 'error');
        } finally {
            // Restore button state
            confirmButton.innerHTML = originalHTML;
            confirmButton.disabled = false;
        }
    }, 1500);
}

// ===== COURSE STATUS FUNCTIONS =====

function approveCourse(courseId) {
    showConfirmModal(
        'Xác nhận duyệt lớp học',
        'Bạn có chắc chắn muốn duyệt lớp học này?',
        () => {
            const row = document.querySelector(`tr[data-course-id="${courseId}"]`);
            updateCourseStatus(row, 'approved');
            updateCourseActions(row, 'approved');
            showNotification('Đã duyệt lớp học thành công', 'success');
        }
    );
}

function pauseCourse(courseId) {
    const row = document.querySelector(`tr[data-course-id="${courseId}"]`);
    const courseName = row.querySelector('.course-name')?.textContent || '';

    showConfirmModal(
        'Xác nhận tạm dừng lớp học',
        `Bạn có chắc chắn muốn tạm dừng lớp học "${courseName}"?`,
        () => {
            updateCourseStatus(row, 'paused');
            updateCourseActions(row, 'paused');
            showNotification('Đã tạm dừng lớp học thành công', 'success');
        }
    );
}

function archiveCourse(courseId) {
    const row = document.querySelector(`tr[data-course-id="${courseId}"]`);
    const courseName = row.querySelector('.course-name')?.textContent || '';

    showConfirmModal(
        'Xác nhận lưu trữ lớp học',
        `Bạn có chắc chắn muốn lưu trữ lớp học "${courseName}"?`,
        () => {
            row.style.opacity = '0.6';
            showNotification('Đã lưu trữ lớp học thành công', 'success');
        }
    );
}

function updateCourseStatus(row, newStatus) {
    const statusElement = row.querySelector('.status');

    // Remove old status classes
    statusElement.classList.remove('pending', 'approved', 'active', 'completed', 'paused', 'cancelled');

    // Add new status class
    statusElement.classList.add(newStatus);

    // Update status text and icon
    const statusInfo = getStatusInfo(newStatus);
    statusElement.innerHTML = `<i class="${statusInfo.icon}"></i> ${statusInfo.name}`;
}

function updateCourseActions(row, status) {
    const actionsContainer = row.querySelector('.action-buttons');
    const courseId = row.dataset.courseId;

    // Clear existing action buttons except view and edit
    const viewBtn = actionsContainer.querySelector('.action-btn.view');
    const editBtn = actionsContainer.querySelector('.action-btn.edit');

    actionsContainer.innerHTML = '';
    actionsContainer.appendChild(viewBtn);

    // Add appropriate action buttons based on status
    if (status === 'pending') {
        const approveBtn = createCourseActionButton('approve', 'fas fa-check', 'Duyệt lớp', courseId);
        actionsContainer.appendChild(approveBtn);
    }

    actionsContainer.appendChild(editBtn);

    if (status === 'active') {
        const pauseBtn = createCourseActionButton('pause', 'fas fa-pause', 'Tạm dừng', courseId);
        actionsContainer.appendChild(pauseBtn);
    } else if (status === 'paused') {
        const resumeBtn = createCourseActionButton('resume', 'fas fa-play', 'Tiếp tục', courseId);
        actionsContainer.appendChild(resumeBtn);
    } else if (status === 'completed') {
        const archiveBtn = createCourseActionButton('archive', 'fas fa-archive', 'Lưu trữ', courseId);
        actionsContainer.appendChild(archiveBtn);
    }

    // Always show cancel button (except for completed/cancelled)
    if (!['completed', 'cancelled'].includes(status)) {
        const cancelBtn = createCourseActionButton('cancel', 'fas fa-times', 'Hủy lớp', courseId);
        actionsContainer.appendChild(cancelBtn);
    }
}

function createCourseActionButton(className, iconClass, title, courseId) {
    const button = document.createElement('button');
    button.className = `action-btn ${className}`;
    button.title = title;
    button.dataset.courseId = courseId;
    button.innerHTML = `<i class="${iconClass}"></i>`;
    return button;
}

// ===== MODAL MANAGEMENT =====

function initializeModals() {
    // Course Detail Modal
    const courseDetailModal = document.getElementById('courseDetailModal');
    const closeCourseDetail = document.getElementById('closeCourseDetail');

    if (closeCourseDetail) {
        closeCourseDetail.addEventListener('click', () => hideModal('courseDetailModal'));
    }

    // Confirm Modal
    const confirmModal = document.getElementById('confirmModal');
    const closeConfirm = document.getElementById('closeConfirm');
    const cancelAction = document.getElementById('cancelAction');

    if (closeConfirm) {
        closeConfirm.addEventListener('click', () => hideModal('confirmModal'));
    }

    if (cancelAction) {
        cancelAction.addEventListener('click', () => hideModal('confirmModal'));
    }

    // Modal Action Buttons
    const editCourseFromModal = document.getElementById('editCourseFromModal');
    const approveCourseFromModal = document.getElementById('approveCourseFromModal');
    const pauseCourseFromModal = document.getElementById('pauseCourseFromModal');
    const cancelCourseFromModal = document.getElementById('cancelCourseFromModal');

    // Edit Course Button
    if (editCourseFromModal) {
        editCourseFromModal.addEventListener('click', function () {
            const courseId = document.getElementById('courseDetailModal').dataset.courseId;
            hideModal('courseDetailModal');
            editCourse(courseId);
        });
    }

    // Approve Course Button
    if (approveCourseFromModal) {
        approveCourseFromModal.addEventListener('click', function () {
            const courseId = document.getElementById('courseDetailModal').dataset.courseId;
            approveCourse(courseId);
            hideModal('courseDetailModal');
        });
    }

    // Pause Course Button
    if (pauseCourseFromModal) {
        pauseCourseFromModal.addEventListener('click', function () {
            const courseId = document.getElementById('courseDetailModal').dataset.courseId;
            pauseCourse(courseId);
            hideModal('courseDetailModal');
        });
    }

    // Cancel Course Button
    if (cancelCourseFromModal) {
        cancelCourseFromModal.addEventListener('click', function () {
            const courseId = document.getElementById('courseDetailModal').dataset.courseId;
            hideModal('courseDetailModal');
            showCancelCourseModal(courseId);
        });
    }

    // Close modals when clicking outside
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('modal-overlay')) {
            const activeModal = e.target;
            hideModal(activeModal.id);
        }
    });

    // Close modals with ESC key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const activeModals = document.querySelectorAll('.modal-overlay.active');
            activeModals.forEach(modal => {
                hideModal(modal.id);
            });
        }
    });

    // Tab functionality in course detail modal
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const tabId = this.dataset.tab;
            const tabContainer = this.closest('.course-tabs');

            // Remove active class from all tabs in this container
            tabContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            tabContainer.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            const targetContent = document.getElementById(tabId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // Export Courses Button
    const exportCoursesBtn = document.getElementById('exportCoursesBtn');
    if (exportCoursesBtn) {
        exportCoursesBtn.addEventListener('click', function () {
            showConfirmModal(
                'Xuất báo cáo lớp học',
                'Bạn có muốn xuất báo cáo tất cả lớp học ra file Excel?',
                () => {
                    showNotification('Đang xuất dữ liệu...', 'info');

                    // Simulate export process
                    setTimeout(() => {
                        showNotification('Đã xuất báo cáo lớp học thành công', 'success');
                    }, 2000);
                }
            );
        });
    }

    // Refresh Table Button
    const refreshTable = document.getElementById('refreshTable');
    if (refreshTable) {
        refreshTable.addEventListener('click', function () {
            showNotification('Đang làm mới dữ liệu...', 'info');

            // Add loading animation to button
            const originalHTML = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải...';
            this.disabled = true;

            // Simulate refresh
            setTimeout(() => {
                this.innerHTML = originalHTML;
                this.disabled = false;
                showNotification('Đã làm mới dữ liệu thành công', 'success');

                // In real app: reload table data
                loadCourses();
            }, 1500);
        });
    }
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus management for accessibility
        const firstFocusable = modal.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            setTimeout(() => firstFocusable.focus(), 100);
        }
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';

        // Clear any stored data
        if (modalId === 'courseDetailModal') {
            delete modal.dataset.courseId;
        }
        if (modalId === 'cancelCourseModal') {
            delete modal.dataset.courseId;
        }
    }
}

function showConfirmModal(title, message, onConfirm, type = 'primary') {
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
    newConfirmButton.addEventListener('click', function () {
        try {
            onConfirm();
        } catch (error) {
            console.error('Error in confirm action:', error);
            showNotification('Có lỗi xảy ra, vui lòng thử lại', 'danger');
        }
        hideModal('confirmModal');
    });

    // Show modal
    showModal('confirmModal');
}

// ===== PAGINATION =====

function initializePagination() {
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');
    const pageButtons = document.querySelectorAll('.page-btn:not(#prevPage):not(#nextPage)');
    const pageSize = document.getElementById('pageSize');

    if (prevPage) {
        prevPage.addEventListener('click', () => changePage(-1));
    }

    if (nextPage) {
        nextPage.addEventListener('click', () => changePage(1));
    }

    pageButtons.forEach(button => {
        if (!isNaN(button.textContent)) {
            button.addEventListener('click', () => goToPage(parseInt(button.textContent)));
        }
    });

    if (pageSize) {
        pageSize.addEventListener('change', () => changePageSize());
    }
}

function changePage(direction) {
    const currentPage = document.querySelector('.page-btn.active');
    const currentPageNum = parseInt(currentPage.textContent);
    const newPageNum = currentPageNum + direction;

    if (newPageNum >= 1) {
        goToPage(newPageNum);
    }
}

function goToPage(pageNum) {
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
    const startItem = (pageNum - 1) * pageSize + 1;
    const endItem = Math.min(pageNum * pageSize, 2847); // Total courses

    document.getElementById('showingStart').textContent = startItem;
    document.getElementById('showingEnd').textContent = endItem;

    // In real application, would fetch new data here
    showNotification(`Đã chuyển đến trang ${pageNum}`, 'info');
}

function changePageSize() {
    const pageSize = document.getElementById('pageSize').value;
    showNotification(`Đã thay đổi hiển thị thành ${pageSize} mục mỗi trang`, 'info');
    // In real application, would reload data with new page size
}

function updatePaginationInfo(visibleCount) {
    document.getElementById('showingEnd').textContent = visibleCount;
    document.getElementById('totalCourses').textContent = visibleCount;
}

// ===== UTILITY FUNCTIONS =====

// Load Courses (Mock Data)
function loadCourses() {
    // In real application, this would fetch data from API
    console.log('Loading courses data...');
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
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
        hideNotification(notification);
    }, 4000);

    // Handle close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        hideNotification(notification);
    });
}

function hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'danger': return 'fa-exclamation-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'info':
        default: return 'fa-info-circle';
    }
}

function addNotificationStyles() {
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